const crypto = require("crypto");
const db = require("../../../config/db");
const ApiError = require("../../../utils/apiError");

let cachedHasItemsOrderIdColumn = null;

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
}

function assertOrderAccessRole(user) {
  const role = user && user.role;
  if (role !== "user" && role !== "admin") {
    throw new ApiError(403, "Acesso proibido.");
  }
}

function parseMoney(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDate(value) {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

async function hasItemsOrderIdColumn(executor = db) {
  if (cachedHasItemsOrderIdColumn === null) {
    cachedHasItemsOrderIdColumn = await executor.schema.hasColumn("items", "order_id");
  }

  return cachedHasItemsOrderIdColumn;
}

function normalizeItems(items) {
  const grouped = new Map();

  for (const item of items) {
    const productId = Number(
      firstDefined(item.product_id, item.idItem, item.id_item)
    );
    const quantity = Number.parseInt(
      firstDefined(item.quantity, item.quantidadeItem, item.quantidade_item),
      10
    );

    if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity <= 0) {
      continue;
    }

    const currentQty = grouped.get(productId) || 0;
    grouped.set(productId, currentQty + quantity);
  }

  return Array.from(grouped.entries()).map(([product_id, quantity]) => ({
    product_id,
    quantity
  }));
}

function mapOrderJsonToDb(payload, authenticatedUserId) {
  const orderSource =
    payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
  const orderId = String(
    firstDefined(orderSource.order_id, orderSource.numeroPedido, orderSource.numero_pedido, "")
  ).trim();
  const orderValue = firstDefined(
    orderSource.value,
    orderSource.valorTotal,
    orderSource.valor_total
  );
  const orderCreationDate = firstDefined(
    orderSource.CreationDate,
    orderSource.dataCriacao,
    orderSource.data_criacao
  );

  const order = {
    user_id: authenticatedUserId,
    order_id: orderId || crypto.randomUUID(),
    value: parseMoney(orderValue),
    CreationDate: parseDate(orderCreationDate)
  };

  return {
    order,
    items: normalizeItems(Array.isArray(orderSource.items) ? orderSource.items : [])
  };
}

function groupOrderRows(rows) {
  const map = new Map();

  for (const row of rows) {
    if (!map.has(row.order_id)) {
      map.set(row.order_id, {
        order_id: row.order_id,
        user_id: row.user_id,
        value: parseMoney(row.value),
        CreationDate: row.CreationDate,
        items: []
      });
    }

    if (row.item_product_id !== null && row.item_product_id !== undefined) {
      map.get(row.order_id).items.push({
        product_id: row.item_product_id,
        quantity: row.item_quantity,
        unit_price: parseMoney(row.item_unit_price)
      });
    }
  }

  return Array.from(map.values());
}

async function fetchOrderRows(baseQuery, executor = db) {
  const withOrderScopedItems = await hasItemsOrderIdColumn(executor);

  const query = baseQuery.leftJoin("items_sale", "items_sale.order_id", "sales.order_id");

  if (withOrderScopedItems) {
    query.leftJoin("items", function joinItems() {
      this.on("items.product_id", "=", "items_sale.product_id").andOn(
        executor.raw("items.order_id = 0")
      );
    });
  } else {
    query.leftJoin("items", "items.product_id", "items_sale.product_id");
  }

  return query
    .select(
      "sales.order_id",
      "sales.user_id",
      "sales.value",
      "sales.CreationDate",
      "items_sale.product_id as item_product_id",
      "items_sale.quantity as item_quantity",
      "items.price as item_unit_price"
    )
    .orderBy("sales.created_at", "desc")
    .orderBy("items_sale.product_id", "asc");
}

async function listOrders(user) {
  assertOrderAccessRole(user);

  const baseQuery = db("sales");
  if (user.role !== "admin") {
    baseQuery.where("sales.user_id", user.id);
  }

  const rows = await fetchOrderRows(baseQuery);
  return groupOrderRows(rows);
}

async function getOrderById(user, orderId) {
  assertOrderAccessRole(user);

  const rows = await fetchOrderRows(db("sales").where("sales.order_id", String(orderId)));
  const grouped = groupOrderRows(rows);

  if (!grouped.length) {
    throw new ApiError(404, "Pedido não encontrado.");
  }

  const order = grouped[0];
  if (user.role !== "admin" && Number(order.user_id) !== Number(user.id)) {
    throw new ApiError(403, "Acesso proibido.");
  }

  return order;
}

async function createOrder(user, payload) {
  assertOrderAccessRole(user);

  const { order, items } = mapOrderJsonToDb(payload, user.id);

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "O pedido deve incluir pelo menos um item válido.");
  }

  return db.transaction(async (trx) => {
    const productIds = items.map((item) => item.product_id);
    const usesOrderScopedItems = await hasItemsOrderIdColumn(trx);
    const productQuery = trx("items")
      .select("product_id", "price")
      .whereIn("product_id", productIds);

    if (usesOrderScopedItems) {
      productQuery.andWhere("order_id", 0);
    }

    const products = await productQuery;

    if (products.length !== productIds.length) {
      throw new ApiError(400, "Um ou mais produtos não existem.");
    }

    const productsById = new Map(products.map((product) => [product.product_id, product]));

    let computedTotal = 0;
    for (const item of items) {
      const product = productsById.get(item.product_id);
      if (!product) {
        throw new ApiError(400, `Produto ${item.product_id} não existe.`);
      }

      computedTotal += parseMoney(product.price) * item.quantity;
    }

    const finalValue = order.value > 0 ? order.value : computedTotal;

    const salesInsert = {
      order_id: order.order_id,
      value: finalValue,
      CreationDate: order.CreationDate,
      user_id: order.user_id
    };

    try {
      await trx("sales").insert(salesInsert);
    } catch (error) {
      if (String(error.message).toLowerCase().includes("unique")) {
        throw new ApiError(409, `order_id '${order.order_id}' já existe no banco.`);
      }
      throw error;
    }

    for (const item of items) {
      await trx("items_sale").insert({
        order_id: order.order_id,
        product_id: item.product_id,
        quantity: item.quantity
      });
    }

    const createdRows = await fetchOrderRows(
      trx("sales").where("sales.order_id", order.order_id),
      trx
    );

    return groupOrderRows(createdRows)[0];
  });
}

module.exports = {
  listOrders,
  getOrderById,
  createOrder,
  mapOrderJsonToDb
};

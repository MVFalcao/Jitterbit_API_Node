const db = require("../../../config/db");
const ApiError = require("../../../utils/apiError");

let cachedHasItemsOrderIdColumn = null;

function parsePrice(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function parseQuantity(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : NaN;
}

function sanitizeProduct(product) {
  return {
    id: product.product_id,
    price: Number(product.price),
    quantity: product.quantity
  };
}

async function hasItemsOrderIdColumn(executor = db) {
  if (cachedHasItemsOrderIdColumn === null) {
    cachedHasItemsOrderIdColumn = await executor.schema.hasColumn("items", "order_id");
  }

  return cachedHasItemsOrderIdColumn;
}

function validateCreatePayload(payload) {
  const parsedPrice = parsePrice(payload.price);
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    throw new ApiError(400, "o preço precisa ser um número não negativo.");
  }

  const parsedQuantity = parseQuantity(payload.quantity);
  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
    throw new ApiError(400, "a quantidade precisa ser um inteiro não negativo.");
  }
}

function validateUpdatePayload(payload) {
  const hasAnyField = payload.price !== undefined || payload.quantity !== undefined;
  if (!hasAnyField) {
    throw new ApiError(400, "Pelo menos um campo deve ser fornecido: preço ou quantidade.");
  }

  if (payload.price !== undefined) {
    const parsedPrice = parsePrice(payload.price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      throw new ApiError(400, "o preço precisa ser um número não negativo.");
    }
  }

  if (payload.quantity !== undefined) {
    const parsedQuantity = parseQuantity(payload.quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      throw new ApiError(400, "a quantidade precisa ser um inteiro não negativo.");
    }
  }
}

async function getScopedItemsQuery(executor = db) {
  const query = executor("items");
  if (await hasItemsOrderIdColumn(executor)) {
    query.where("order_id", 0);
  }

  return query;
}

async function getByIdOrFail(id, executor = db) {
  const query = executor("items").where({ product_id: id });
  if (await hasItemsOrderIdColumn(executor)) {
    query.andWhere({ order_id: 0 });
  }

  const product = await query.first();
  if (!product) {
    throw new ApiError(404, "Produto não encontrado.");
  }

  return product;
}

function getInsertedId(insertResult) {
  if (Array.isArray(insertResult)) {
    const first = insertResult[0];
    if (typeof first === "object" && first !== null) return first.id;
    return first;
  }

  if (typeof insertResult === "object" && insertResult !== null) {
    return insertResult.id;
  }

  return insertResult;
}

async function listProducts() {
  const query = await getScopedItemsQuery();
  const products = await query.select("*").orderBy("product_id", "asc");
  return products.map(sanitizeProduct);
}

async function getProductById(id) {
  const product = await getByIdOrFail(id);
  return sanitizeProduct(product);
}

async function createProduct(payload) {
  validateCreatePayload(payload);

  const parsedPrice = parsePrice(payload.price);
  const parsedQuantity = parseQuantity(payload.quantity);
  const usesOrderScopedItems = await hasItemsOrderIdColumn();

  const insertPayload = {
    price: parsedPrice,
    quantity: parsedQuantity
  };

  let forcedProductId = null;
  if (usesOrderScopedItems) {
    const maxRow = await db("items").where({ order_id: 0 }).max({ max: "product_id" }).first();
    forcedProductId = Number(maxRow && maxRow.max ? maxRow.max : 0) + 1;
    insertPayload.product_id = forcedProductId;
    insertPayload.order_id = 0;
  }

  const insertResult = await db("items").insert(insertPayload);
  const productId = forcedProductId || getInsertedId(insertResult);
  const created = await getByIdOrFail(productId);
  return sanitizeProduct(created);
}

async function updateProduct(id, payload) {
  await getByIdOrFail(id);
  validateUpdatePayload(payload);

  const patch = {};
  if (payload.price !== undefined) patch.price = parsePrice(payload.price);
  if (payload.quantity !== undefined) patch.quantity = parseQuantity(payload.quantity);
  patch.updated_at = db.fn.now();

  const query = db("items").where({ product_id: id });
  if (await hasItemsOrderIdColumn()) {
    query.andWhere({ order_id: 0 });
  }

  await query.update(patch);
  const updated = await getByIdOrFail(id);
  return sanitizeProduct(updated);
}

async function removeProduct(id) {
  await getByIdOrFail(id);

  const query = db("items").where({ product_id: id });
  if (await hasItemsOrderIdColumn()) {
    query.andWhere({ order_id: 0 });
  }

  await query.delete();
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  removeProduct
};

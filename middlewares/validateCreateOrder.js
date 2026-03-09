const ApiError = require("../utils/apiError");

function hasValidItemsArray(items) {
  return Array.isArray(items) && items.length > 0;
}

function validateCreateOrder(req, res, next) {
  const body = req.body;

  if (!body || typeof body !== "object") {
    return next(new ApiError(400, "Requisição inválida."));
  }

  const hasItems = hasValidItemsArray(body.items);

  if (!hasItems) {
    return next(new ApiError(400, "O pedido deve incluir um array de itens não vazio."));
  }

  return next();
}

module.exports = validateCreateOrder;

const productsService = require("../services/products.service");

async function list(req, res, next) {
  try {
    const products = await productsService.listProducts();
    res.status(200).json({ products });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const product = await productsService.getProductById(id);
    res.status(200).json({ product });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const product = await productsService.createProduct(req.body);
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const product = await productsService.updateProduct(id, req.body);
    res.status(200).json({ product });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    await productsService.removeProduct(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove
};

const ordersService = require("../services/orders.service");

async function listMyOrders(req, res, next) {
  try {
    const orders = await ordersService.listOrders(req.user);
    res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
}

async function getOrderById(req, res, next) {
  try {
    const orderId = String(req.params.id);
    const order = await ordersService.getOrderById(req.user, orderId);
    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
}

async function createOrder(req, res, next) {
  try {
    const order = await ordersService.createOrder(req.user, req.body);
    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listMyOrders,
  getOrderById,
  createOrder
};

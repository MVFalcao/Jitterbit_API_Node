const express = require("express");
const authMiddleware = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");
const validateCreateOrder = require("../../../middlewares/validateCreateOrder");
const ordersController = require("../controllers/orders.controller");

const router = express.Router();

/**
 * @swagger
 * /orders/list:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Lista de pedidos do usuário autenticado (cliente) ou todos os pedidos (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
*        403:
*          description: Acesso proibido (apenas clientes veem seus pedidos, admins veem todos)
*        500:
*          description: Erro interno do servidor
 */
router.get("/list", authMiddleware, ordersController.listMyOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: pega um pedido por ID (usuario autenticado ou admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados do pedido
 *       404:
 *         description: Pedido não encontrado
 *       403:
 *         description: Acesso proibido (clientes só podem acessar seus próprios pedidos)
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/:id", authMiddleware, ordersController.getOrderById);

/**
 * @swagger
 * /orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Cria um novo pedido para o usuário autenticado (cliente) ou admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: o pedido foi criado com sucesso
 *       400:
 *         description: dados do pedido inválidos, por favor verifique os campos
 *       403:
 *         description: Acesso proibido (apenas clientes e admins podem criar pedidos)
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/", authMiddleware, validateCreateOrder, ordersController.createOrder);

module.exports = router;

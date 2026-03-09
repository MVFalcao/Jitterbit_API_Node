const express = require("express");
const authMiddleware = require("../../../middlewares/authMiddleware");
const validateCreateOrder = require("../../../middlewares/validateCreateOrder");
const ordersController = require("../controllers/orders.controller");

const router = express.Router();

/**
 * @swagger
 * /orders/list:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Lista pedidos do usuário autenticado; admin visualiza todos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *       401:
 *         description: token de acesso inválido ou expirado
 *       403:
 *         description: Acesso proibido para o papel atual
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/list", authMiddleware, ordersController.listMyOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Retorna um pedido por ID (dono ou admin)
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
 *       401:
 *         description: token de acesso inválido ou expirado
 *       403:
 *         description: Acesso proibido para visualizar o pedido
 *       404:
 *         description: Pedido não encontrado
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
 *     summary: Cria um novo pedido (usuário ou admin)
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
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Dados do pedido inválidos
 *       401:
 *         description: token de acesso inválido ou expirado
 *       403:
 *         description: Acesso proibido para o papel atual
 *       409:
 *         description: order_id já existe
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/", authMiddleware, validateCreateOrder, ordersController.createOrder);

module.exports = router;
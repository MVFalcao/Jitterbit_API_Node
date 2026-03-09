const express = require("express");
const authMiddleware = require("../../../middlewares/authMiddleware");
const roleMiddleware = require("../../../middlewares/roleMiddleware");
const productsController = require("../controllers/products.controller");

const router = express.Router();

/**
 * @swagger
 * /products:
 *   get:
 *     tags:
 *       - Products
 *     summary: lista todos os produtos disponíveis
 *     responses:
 *       200:
 *         description: Lista de produtos
 */
router.get("/", productsController.list);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get produto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do produto
 *       404:
 *         description: Produto não encontrado
 *      500:
 *        description: Erro interno do servidor
 */
router.get("/:id", productsController.getById);

/**
 * @swagger
 * /products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Cria um produto (apenas admins)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Produto criado
 *       403:
 *         description: Acesso proibido (apenas admins podem criar produtos)
 *      400:
 *         description: Dados inválidos
 *      500:
 *        description: Erro interno do servidor
 */
router.post("/", authMiddleware, roleMiddleware("admin"), productsController.create);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     tags:
 *       - Products
 *     summary: atualizar produto (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductRequest'
 *     responses:
 *       200:
 *         description: Produto atualizado
 *       403:
 *         description: Acesso proibido (apenas admins podem atualizar produtos)
 *       404:
 *         description: Produto não encontrado
 *      400:
 *         description: Dados inválidos
 *      500:
 *        description: Erro interno do servidor
 */
router.put("/:id", authMiddleware, roleMiddleware("admin"), productsController.update);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     tags:
 *       - Products
 *     summary: produto deletado (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Produto excluído com sucesso
 *       403:
 *         description: Acesso proibido (apenas admins podem excluir produtos)
 *      404:
 *        description: Produto não encontrado
 *     500:
 *       description: Erro interno do servidor
 */
router.delete("/:id", authMiddleware, roleMiddleware("admin"), productsController.remove);

module.exports = router;

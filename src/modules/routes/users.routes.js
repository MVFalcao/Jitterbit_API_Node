const express = require("express");
const authMiddleware = require("../../../middlewares/authMiddleware");
const authController = require("../controllers/auth.controller");

const router = express.Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Return the authenticated user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: token de acesso inválido ou expirado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/me", authMiddleware, authController.me);

module.exports = router;

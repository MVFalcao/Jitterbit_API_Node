const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registrado e autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: dados inválidos, por favor verifique os campos
 *       409:
 *         description: Email já registrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login para receber o token de acesso e refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Autenticado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: email e senha são necessários
 *       401:
 *         description: credenciais inválidas
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Gera um novo token de acesso usando um refresh token válido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: Novo token gerado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: token de atualização obrigatório
 *       401:
 *         description: refresh token inválido ou expirado
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/refresh", authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Revogar acesso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       204:
 *         description: deslogado com sucesso
 *       400:
 *         description: token de atualização obrigatório
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/logout", authController.logout);

module.exports = router;
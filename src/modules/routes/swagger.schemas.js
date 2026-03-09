/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Erro interno do servidor
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: João
 *         email:
 *           type: string
 *           format: email
 *           example: joao@email.com
 *         role:
 *           type: string
 *           example: user
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: João da Silva
 *         email:
 *           type: string
 *           format: email
 *           example: joao@email.com
 *         password:
 *           type: string
 *           example: senhaForte123
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: joao@email.com
 *         password:
 *           type: string
 *           example: senhaForte123
 *     RefreshRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: abcdef123456
 *     TokenResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         refreshToken:
 *           type: string
 *           example: 9f6f25e9e8a1...
 *         user:
 *           $ref: '#/components/schemas/User'
 *     CreateOrderItem:
 *       type: object
 *       description: Aceita formato interno (product_id/quantity) ou integracao externa (idItem/quantidadeItem)
 *       properties:
 *         product_id:
 *           type: integer
 *           example: 10
 *         quantity:
 *           type: integer
 *           example: 2
 *         idItem:
 *           type: string
 *           example: "2434"
 *         quantidadeItem:
 *           type: integer
 *           example: 1
 *         valorItem:
 *           type: number
 *           format: float
 *           example: 1000
 *       oneOf:
 *         - required:
 *             - product_id
 *             - quantity
 *         - required:
 *             - idItem
 *             - quantidadeItem
 *     CreateOrderRequest:
 *       type: object
 *       required:
 *         - items
 *       properties:
 *         order_id:
 *           type: string
 *           example: ORD-2026-001
 *         value:
 *           type: number
 *           format: float
 *           example: 120.5
 *         CreationDate:
 *           type: string
 *           format: date-time
 *           example: 2026-03-09T12:00:00.000Z
 *         numeroPedido:
 *           type: string
 *           example: v10089015vdb-01
 *         valorTotal:
 *           type: number
 *           format: float
 *           example: 10000
 *         dataCriacao:
 *           type: string
 *           format: date-time
 *           example: 2023-07-19T12:24:11.5299601+00:00
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CreateOrderItem'
 *     CreateProductRequest:
 *       type: object
 *       required:
 *         - price
 *         - quantity
 *       properties:
 *         price:
 *           type: number
 *           format: float
 *           example: 59.9
 *         quantity:
 *           type: integer
 *           example: 100
 *     UpdateProductRequest:
 *       type: object
 *       properties:
 *         price:
 *           type: number
 *           format: float
 *           example: 79.9
 *         quantity:
 *           type: integer
 *           example: 50
 */

module.exports = {};

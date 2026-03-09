# Jitterbit API Node

API REST em Node.js para autenticação, catálogo de produtos e gestão de pedidos, com controle de acesso por papel (`user` e `admin`), persistência em banco SQL via Knex e documentação Swagger.

## Requisitos

- Node.js `>= 18`
- NPM

## Configuração de ambiente

Crie/ajuste o arquivo `.env`:

```env
NODE_ENV=development
PORT=3000

DB_CLIENT=better-sqlite3
DB_FILENAME=./dev.sqlite3

JWT_ACCESS_SECRET=sua_chave_secreta_forte
JWT_ACCESS_EXPIRES_IN=1h
REFRESH_TOKEN_TTL_DAYS=7

ADMIN_SEED_NAME=Admin
ADMIN_SEED_EMAIL=admin@gmail.com
ADMIN_SEED_PASSWORD=senha123
```

## Instalação e execução

```bash
npm install
```

Opcional (executar migrations manualmente):

```bash
npm run migrate
```

Criar/atualizar usuário administrador:

```bash
npm run seed:admin
```

Subir API em desenvolvimento:

```bash
npm run dev
```

Produção:

```bash
npm start
```

Se o PowerShell bloquear `npm`, use `npm.cmd`.

## Documentação Swagger

- UI: `http://localhost:3000/docs/`
- OpenAPI JSON: `http://localhost:3000/docs.json`

## Endpoints principais

### Health

- `GET /health`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Usuário

- `GET /users/me` (Bearer token)

### Produtos

- `GET /products`
- `GET /products/:id`
- `POST /products` (admin)
- `PUT /products/:id` (admin)
- `DELETE /products/:id` (admin)

### Pedidos

- `GET /orders/list` (user/admin)
- `GET /orders/:id` (dono ou admin)
- `POST /orders` (user/admin)

## Regras de negócio relevantes

- `register/login` retornam:
  - `accessToken`
  - `refreshToken`
  - dados do usuário
- `refresh` revoga o refresh token antigo e emite novo par de tokens.
- Em produtos:
  - `price` deve ser número não negativo.
  - `quantity` deve ser inteiro não negativo.
- Em pedidos:
  - Deve existir ao menos um item válido.
  - Itens duplicados por `product_id` são agrupados (soma de quantidades).
  - Se `value` enviado for `<= 0`, o serviço calcula com base em preço x quantidade.

## Banco de dados (resumo)

- `users`: usuários e papéis.
- `refresh_tokens`: sessão de refresh token com revogação.
- `items`: catálogo/estoque de produtos.
- `sales`: cabeçalho do pedido.
- `items_sale`: itens do pedido.

## Testes

Atualmente existe um teste automatizado básico em:

- `testes/tests/api.test.js` (valida `GET /health`)


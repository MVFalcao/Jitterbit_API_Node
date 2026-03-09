const db = require("../config/db");
const ApiError = require("../utils/apiError");
const { verifyAccessToken } = require("../utils/jwt");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new ApiError(401, "Acesso não autorizado, faltando token de acesso bearer.");
    }

    const decoded = verifyAccessToken(token);
    const userId = Number(decoded.sub);
    if (!Number.isInteger(userId)) {
      throw new ApiError(401, "Acesso não autorizado, token de acesso inválido.");
    }

    const user = await db("users").where({ id: userId }).first();
    if (!user) {
      throw new ApiError(401, "Usuário do token não existe mais.");
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authMiddleware;

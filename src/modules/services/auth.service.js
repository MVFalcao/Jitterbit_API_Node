const crypto = require("crypto");
const db = require("../../../config/db");
const ApiError = require("../../../utils/apiError");
const { hashPassword, comparePassword } = require("../../../utils/password");
const { signAccessToken } = require("../../../utils/jwt");
const {
  generateRefreshToken,
  hashRefreshToken,
  createRefreshTokenExpiry
} = require("../../../utils/refreshToken");

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}

function getInsertedId(insertResult) {
  if (Array.isArray(insertResult)) {
    const first = insertResult[0];
    if (typeof first === "object" && first !== null) {
      return first.id;
    }

    return first;
  }

  if (typeof insertResult === "object" && insertResult !== null) {
    return insertResult.id;
  }

  return insertResult;
}

async function createSession(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = generateRefreshToken();
  const refreshHash = hashRefreshToken(refreshToken);

  await db("refresh_tokens").insert({
    id: crypto.randomUUID(),
    user_id: user.id,
    token_hash: refreshHash,
    expires_at: createRefreshTokenExpiry()
  });

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user)
  };
}

async function register({ name, email, password }) {
  if (!name || !email || !password) {
    throw new ApiError(400, "são necessario nome, email e senha.");
  }

  if (String(password).length < 6) {
    throw new ApiError(400, "Senha deve ter pelo menos 6 digitos.");
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await db("users").where({ email: normalizedEmail }).first();
  if (existing) {
    throw new ApiError(409, "Email já usado.");
  }

  const passwordHash = await hashPassword(password);
  const insertResult = await db("users").insert({
    name: String(name).trim(),
    email: normalizedEmail,
    password_hash: passwordHash
  });

  const userId = getInsertedId(insertResult);
  const user = await db("users").where({ id: userId }).first();

  if (!user) {
    throw new ApiError(500, "Falha ao criar o usuario / Falha interna.");
  }

  return createSession(user);
}

async function login({ email, password }) {
  if (!email || !password) {
    throw new ApiError(400, "Email e senha são necessários.");
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await db("users").where({ email: normalizedEmail }).first();

  if (!user) {
    throw new ApiError(401, "Credenciais inválidas.");
  }

  const passwordMatches = await comparePassword(password, user.password_hash);
  if (!passwordMatches) {
    throw new ApiError(401, "Credenciais inválidas.");
  }

  return createSession(user);
}

async function refresh(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(400, "Token de atualização é necessario.");
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const currentSession = await db("refresh_tokens")
    .where({ token_hash: tokenHash })
    .whereNull("revoked_at")
    .first();

  if (!currentSession) {
    throw new ApiError(401, "Token de atualização inválido.");
  }

  if (new Date(currentSession.expires_at) <= new Date()) {
    await db("refresh_tokens").where({ id: currentSession.id }).update({ revoked_at: db.fn.now() });
    throw new ApiError(401, "Token de atualização expirado.");
  }

  const user = await db("users").where({ id: currentSession.user_id }).first();
  if (!user) {
    throw new ApiError(401, "Usuário do token de atualização inválido.");
  }

  await db("refresh_tokens").where({ id: currentSession.id }).update({ revoked_at: db.fn.now() });

  return createSession(user);
}

async function logout(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(400, "Token de atualização é necessário.");
  }

  const tokenHash = hashRefreshToken(refreshToken);
  await db("refresh_tokens")
    .where({ token_hash: tokenHash })
    .whereNull("revoked_at")
    .update({ revoked_at: db.fn.now() });
}

module.exports = {
  register,
  login,
  refresh,
  logout
};

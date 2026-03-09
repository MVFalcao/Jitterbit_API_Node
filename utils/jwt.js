const jwt = require("jsonwebtoken");
const ApiError = require("./apiError");

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN ;

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired access token.");
  }
}

module.exports = {
  signAccessToken,
  verifyAccessToken
};

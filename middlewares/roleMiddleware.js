const ApiError = require("../utils/apiError");

function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Autenticação necessária."));
    }

    if (req.user.role !== requiredRole) {
      return next(new ApiError(403, "Acesso proibido."));
    }

    return next();
  };
}

module.exports = roleMiddleware;

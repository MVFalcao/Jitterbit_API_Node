const authService = require("../services/auth.service");

async function register(req, res, next) {
  try {
    const payload = await authService.register(req.body);
    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const payload = await authService.login(req.body);
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const payload = await authService.refresh(req.body.refreshToken);
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.body.refreshToken);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout
};

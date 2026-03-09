const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./users.routes"));
router.use("/orders", require("./orders.routes"));
router.use("/products", require("./products.routes"));

module.exports = router;

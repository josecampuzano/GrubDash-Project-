const router = require("express").Router();
const controller = require("./orders.controller")
const methodNotAllowed = require("../errors/methodNotAllowed")

// path => /orders
router.route("/")
    .post(controller.create)
    .get(controller.list)
    .all(methodNotAllowed)

// path => /orders/:orderId
router.route("/:orderId")
    .get(controller.read)
    .put(controller.update)
    .delete(controller.delete)
    .all(methodNotAllowed)

module.exports = router;

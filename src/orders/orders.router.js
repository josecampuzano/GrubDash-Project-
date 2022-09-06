const router = require("express").Router();
const controller = require("./orders.controller")

// TODO: Implement the /orders routes needed to make the tests pass

router.route("/").post(controller.create).get(controller.list)
router.route("/:orderId").get(controller.read)

module.exports = router;

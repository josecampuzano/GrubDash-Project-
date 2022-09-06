const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./dishes.controller")

// TODO: Implement the /dishes routes needed to make the tests pass

router.route("/").post(controller.create).get(controller.list)
router.route("/:dishId").get(controller.read).put(controller.update).all(methodNotAllowed)

module.exports = router;

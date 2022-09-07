const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./dishes.controller")

//path => /dishes
router.route("/")
    .post(controller.create)
    .get(controller.list)
    .all(methodNotAllowed)

// path => /dishes/:dishId
router.route("/:dishId")
    .get(controller.read)
    .put(controller.update)
    .all(methodNotAllowed)

module.exports = router;

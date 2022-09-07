const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

// lists all the orders
function list(req, res, next) {
    res.json({ data: orders })
}

// call back function used to check that the correct properties are passed in the req.body
function bodyDataHas(propertyName) {
    return function (req, res, next) {
        const { data = {} } = req.body
        if (data[propertyName]) {
            return next()
        }
        next({
            status: 400,
            message: `Must include ${propertyName}`
        })
    }
}

// checks that the dishes property is not empty
function checkDishesEmpty(req, res, next) { //has res.locals.dishesArray
    const { ...orders } = req.body
    const dishesArray = orders.data.dishes
    res.locals.dishesArray = dishesArray
    if(dishesArray.length === 0) {
        next({
            status: 400,
            message: `Dishes must include at least one dish`
        })
    }
    return next()
}

// checks that the dished property is an array
function checkDishesIsAnArray(req, res, next) {
    let result = Array.isArray(res.locals.dishesArray)
    if(result === true) {
        return next()
    }
    next({
        status: 400,
        message: `The dish entry must be an array`
    })
}

// creates an entry for an order
function create(req, res, next) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body
    const newOrder = { 
        id: Number(nextId), 
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status,
        dishes: dishes,
    }
    orders.push(newOrder)
    res.status(201).json({ data: newOrder })
}

// checks that the order exists and establishes res.locals.order
function orderExists(req, res, next) {
    const { orderId } = req.params
    const foundOrder = orders.find((order) => order.id == orderId)
    if (foundOrder) {
        res.locals.order = foundOrder
        return next()
    }
    next({
        status: 404,
        message: `The order with orderId: ${orderId} does not exist`
    })
}

// reads out the unique order
function read(req, res, next) {
    res.json({ data: res.locals.order })
}

// checks that the status property is one of the four options => "pending", "preparing", "out-for-delivery", "delivered"
function statusPropertyIsValid(req, res, next){
    const { data: { status } = {} } = req.body
    const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"]
    if(validStatus.includes(status)){
        return next()
    }
    next({
        status: 400,
        message: `The status property must be one of the following: "pending", "preparing", "out-for-delivery", "delivered"`
    })
}

// updates the order object
function update(req, res, next) {
    const order = res.locals.order
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body

    order.deliverTo = deliverTo
    order.mobileNumber = mobileNumber
    order.status = status
    order.dishes = dishes

    res.json({ data: order })
}

// checks if the status is !pending Goal: only allow users to delete if the status is pending
function checkStatusPending(req, res, next) {
    const status = res.locals.order.status
    if (status !== "pending") {
        next({
            status: 400,
            message: `Order can only be deleted when status is pending`
        })
    }
    return next()
}

// delete a unique order
function destroy(req, res, next) {
    const index = orders.findIndex((dish) => dish.id === res.locals.order.id)
    const deletedOrder = orders.splice(index, 1)
    res.sendStatus(204)
}

// if an ID is provided in the req.body on an update method, this function verifies that the id matches the id entered in the path. Goal: prevent user from updating the id
function orderIdValidation(req, res, next) {
    const { data: { id } = {} } = req.body
    const { orderId } = req.params

    const checkIdMatch = (id, orderId) => {
        if (id == orderId) {
            return next()
        }
        next({
            status: 400,
            message: `The id you entered in the path ${orderId} does not math the id in the body ${id}`
        })
    }

    id ? checkIdMatch(id, orderId) : next()
}

// verifies the quantity property
function dishQuantityValidation(req, res, next) {
    res.locals.dishesArray.forEach((dish, index) => {
        if(!Number.isInteger(dish.quantity) || dish.quantity <= 0) {
            return next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`
            })
        }
    })
    next()
}

module.exports = {
    list,
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        checkDishesEmpty,
        checkDishesIsAnArray,
        dishQuantityValidation,
        create,
    ],
    read: [
        orderExists,
        read,
    ],
    update: [
        orderExists,
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        bodyDataHas("status"),
        orderIdValidation,
        statusPropertyIsValid,
        checkDishesEmpty,
        checkDishesIsAnArray,
        dishQuantityValidation,
        update
    ],
    delete: [
        orderExists,
        checkStatusPending,
        destroy,
    ]
}
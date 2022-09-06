const path = require("path");
const { forEach } = require("../data/orders-data");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

function list(req, res, next) {
    res.json({ data: orders })
}

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

function read(req, res, next) {
    res.json({ data: res.locals.order })
}

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

function update(req, res, next) {
    const order = res.locals.order
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body

    order.deliverTo = deliverTo
    order.mobileNumber = mobileNumber
    order.status = status
    order.dishes = dishes

    res.json({ data: order })
}

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

function destroy(req, res, next) {
    const index = orders.findIndex((dish) => dish.id === res.locals.order.id)
    const deletedOrder = orders.splice(index, 1)
    res.sendStatus(204)
}

module.exports = {
    list,
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        checkDishesEmpty,
        checkDishesIsAnArray,
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
        statusPropertyIsValid,
        update
    ],
    delete: [
        orderExists,
        checkStatusPending,
        destroy,
    ]
}
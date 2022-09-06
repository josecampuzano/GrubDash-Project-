const path = require("path");
const { forEach } = require("../data/orders-data");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

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




module.exports = {
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        checkDishesEmpty,
        checkDishesIsAnArray,
        create,
    ]
}
const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

// lists all the dishes
function list(req, res, next) {
    res.json({ data: dishes })
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

// creates an entry for a dish
function create(req, res, next) {
    const { data: { name, description, price, image_url } = {} } = req.body
    const newDish = {
        id: Number(nextId),
        name: name,
        description: description,
        price: price,
        image_url: image_url,
    }
    dishes.push(newDish)
    res.status(201).json({ data: newDish })
}

// checks that the price property is not less than zero
function checkPriceLessThanZero(req, res, next) {
    const { data: { price } = {} } = req.body
    if (price >= 0) {
        return next()
    }
    next({
        status: 400,
        message: "The price cannot be less than zero(0)"
    })
}

// checks that the price property is a number
function checkPriceIsANumber(req, res, next){
    const { data: { price } = {} } = req.body
    if(typeof price == "number"){
        return next()
    }
    next({
        status: 400,
        message: "The price must be a number"
    })
}

// if an ID is provided in the req.body on an update method, this function verifies that the id matches the id entered in the path. Goal: prevent user from updating the id
function dishIdValidation(req, res, next) {
    const { data: { id } = {} } = req.body
    const { dishId } = req.params

    const checkIdMatch = (id, dishId) => {
        if(id == dishId) {
            return next()
        }
        next({
            status: 400, 
            message: `The id you entered in the path: ${dishId} does not match the id in the body: ${id}`
        })
    }

    id ? checkIdMatch(id, dishId) : next()

}

// checks that the dish exists and establishes res.locals.dish
function dishExists(req, res, next) {
    const { dishId } = req.params
    const foundDish = dishes.find((dish) => dish.id === dishId)
    if (foundDish) {
        res.locals.dish = foundDish
        return next()
    }
    next({
        status: 404,
        message: `The dish with dishId: ${dishId} does not exist!`,
    })
}

// reads out the unique dish
function read(req, res, next) {
    res.json({ data: res.locals.dish })
}

// updates the dish object 
function update(req, res, next) {
    const dish = res.locals.dish
    const { data: { name, description, price, image_url } = {} } = req.body

    dish.name = name
    dish.description = description
    dish.price = price
    dish.image_url = image_url

    res.json({ data: dish })
}




module.exports = {
    list,
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        checkPriceLessThanZero,
        create,
    ],
    read: [
        dishExists,
        read,
    ],
    update: [
        dishExists,
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        dishIdValidation,
        checkPriceLessThanZero,
        checkPriceIsANumber,
        update,
    ],
}
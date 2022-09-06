const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res, next) {
    res.json({ data: dishes })
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

function checkDishIdMatchesDataId(req, res, next){
    const { data: { id } = {} } = req.body
    const { dishId } = req.params
    if(id == dishId) {
        return next()
    }
    next({
        status: 400, 
        message: `The id you entered in the path: ${dishId} does not match the id in the body: ${id}`
    })
}

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

function read(req, res, next) {
    res.json({ data: res.locals.dish })
}

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
        // checkDishIdMatchesDataId,
        update,
    ],
}
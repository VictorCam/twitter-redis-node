/*
 * Author: GitHub @VictorCam
 */

const Joi = require("joi")

module.exports = function() {
    return function(req, res, next) {
        //vaidate req.query.amount and req.query.page
        const schema = Joi.object().keys({
            amount: Joi.number().integer().min(1).max(100).required().label("amount must be a number between 1 and 100"),
            page: Joi.number().integer().min(1).max(1000000).required().label("page must be a number between 1 and 1000000")
        })

        //validate req.query.amount and req.query.page out of the req.query object
        let valid = schema.validate({"amount": req.query.amount, "page": req.query.page})
        if(valid.error) {
            if(valid.error.details[0].type !== 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
            return res.status(400).json({"error": "invalid user input"})
        }

        //remove amount and page in case we validate req.query on the route
        delete req.query.amount
        delete req.query.page

        //set the pagination indexes to use on the specified route
        valid.value.amount--
        valid.value.page--
        req.start = (valid.value.amount*valid.value.page)+valid.value.page
        req.end = (valid.value.amount*(valid.value.page+1))+valid.value.page

        return next()
    }
}
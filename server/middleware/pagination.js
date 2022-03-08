const Joi = require("joi")

module.exports = function() {
    return function(req, res, next) {
        try {

            //vaiddate req.query.amount and req.query.page
            const schema = Joi.object().keys({
                amount: Joi.number().integer().min(1).max(100).required(),
                page: Joi.number().integer().min(1).max(1000000).required()
            })

            //validate req.query.amount and req.query.page out of the req.query object
            let valid = schema.validate({"amount": req.query.amount, "page": req.query.page})
            if(valid.error) {
                let label = valid.error.details[0].context.label
                if(label === "amount") return res.status(400).json({"error": "amount must be a number between 1 and 100"})
                if(label === "page") return res.status(400).json({"error": "page must be a number between 1 and 1000000"})
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
        catch(e) {
            console.log("error in pagination", e)
            return res.status(500).send("error occured")
        }
    }
}
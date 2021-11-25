const Joi = require("joi")

module.exports = function() {
    return function(req, res, next) {
        try {

            //vaiddate req.query.amount and req.query.page
            const schema = Joi.object().keys({
                amount: Joi.number().integer().min(0).max(100).required(),
                page: Joi.number().integer().min(0).required()
            })

            //validate
            var valid = schema.validate({"amount": req.query.amount, "page": req.query.page})
            if(valid.error) {
                var label = valid.error.details[0].context.label
                if(label == "amount") return res.status(200).json({"error": "amount must be a number between 0 and 100"})
                if(label == "page") return res.status(200).json({"error": "page must be a number"})
                return res.status(500).json({"error": "something went wrong"})
            }

            //we need to check on each route that uses
            //this if they are going out of the range
            //because they get an error if the renge is too large

            delete req.query.amount
            delete req.query.page

            var amount = valid.value.amount
            var page = valid.value.page

            req.start = amount*page+page
            req.end = amount*((page+1))+page
            return next()
        }
        catch(e) {
            console.log("error in pagination", e)
            return res.status(500).send("error occured")
        }
    }
}
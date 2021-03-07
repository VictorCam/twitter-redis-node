const express = require("express")
const router = express.Router()
const cors = require("cors")
const connectsql = require("../server_connection")
const check_token = require("../middleware/check_token")
const joi = require('joi')
const Ajv = require('ajv')
const ajv = new Ajv()
  
router.get("/posts", check_token(), async (req, res) => {
    try {
        var sql = "SELECT USER.ID, USER.Name, POST.POST_ID, POST.post, USER.icon FROM user_tables USER, user_post POST WHERE USER.ID = POST.ID"
        var [rows, fields] = await connectsql.promise().query(sql)
        return res.status(200).json(rows)
    }
    catch(e) {
        console.log("error in /posts route ==", e)
        return res.sendStatus(500)
    }
})

router.post("/create_post", check_token(), (req, res) => { //make sure to allow only VALID json only requests
    const schema = {
        type: 'object', required: ['message'], additionalProperties: false,
        properties: {
            message: { type: 'string', minLength: 1, maxLength: 100 } 
        }
    }
    const validate = ajv.compile(schema)
    validate(req.body)
    if(validate.errors) {
        var error = {}
        error.error = validate.errors[0].dataPath
        error.message = validate.errors[0].message
        return res.status(422).send(error.message)
    }

    var sql = "INSERT INTO user_post(ID, Post) VALUES(?, ?)"
    connectsql.query(sql, [req.id, req.body.message], function (err, data) {
        if (!err) {
            var result = {}
            result.post = req.body.message
            console.log(result)
            return res.status(200).send(result)
        }
        else {
            return res.status(500).json("unable to create post")
        }
    })
})

router.put("/edit_post", check_token(), (req, res) => {
    const schema = {
        type: 'object', required: ['message', 'post_id'], additionalProperties: false,
        properties: {
            message: { type: 'string', minLength: 1, maxLength: 100 },
            post_id: { type: 'integer', minimum: 1}
        }
    }
    const validate = ajv.compile(schema)
    validate(req.body)
    if(validate.errors) {
        const error = {}
        error.error = validate.errors[0].dataPath
        error.message = validate.errors[0].message
        return res.status(422).send(error.message)
    }
    
    var sql = "UPDATE user_post SET Post = (?) WHERE user_post.POST_ID = (?) AND user_post.ID = (?)"
    connectsql.query(sql, [req.body.message, req.body.post_id, req.id], function (err, data) {
        if (!err) {
            return res.sendStatus(200)
        }
        else {
            res.status(500).json("unable to update post")
        }
    })
})

router.delete("/delete_post/:post", check_token(), (req, res) => {
    const post = joi.number().integer().required().min(1).validate(req.params.post)
    if(post.error) return res.status(422).json(post.error.details[0].message)

    const sql = "DELETE FROM user_post WHERE user_post.POST_ID = (?)" //note: must check if user owns this post
    connectsql.query(sql, [req.params.post], function (err, data) {
        if (!err) {
            res.sendStatus(200)
        }
        else {
            res.status(500).json("unable to delete post")
        }
    })
})

router.use(cors());

module.exports = router;

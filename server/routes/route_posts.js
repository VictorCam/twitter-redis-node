const express = require("express")
const router = express.Router()
const cors = require("cors")
const connectsql = require("../server_connection")
const check_token = require("../middleware/check_token")
const joi = require('joi')
  
router.get("/posts", check_token(), (req, res) => {
    var sql = "SELECT USER.ID, USER.Name, POST.POST_ID, POST.post FROM user_tables USER, user_post POST WHERE USER.ID = POST.ID"
    connectsql.query(sql, function (err, data) {
        if (!err) {
            return res.status(200).json(data)
        }
        else {
            return res.status(500).json("unable to load posts")
        }
    })
})

router.post("/create_post", check_token(), (req, res) => { //make sure to allow only VALID json only requests
    const schema = joi.object({
        message: joi.string().min(1).max(100).required()
    })
    
    post = schema.validate(req.body)
    
    if(post.error) return res.status(422).json(post.error.details[0].message)

    var sql = "INSERT INTO user_post(ID, Post) VALUES(?, ?)"
    connectsql.query(sql, [req.id, req.body.message], function (err, data) {
        if (!err) {
            const result = {}
            data.post = req.body[0]
            return res.status(200).json(result)
        }
        else {
            return res.status(500).json("unable to create post")
        }
    })
})

router.put("/edit_post", check_token(), (req, res) => {
    const schema = joi.object({
        message: joi.string().min(1).max(100).required(),
        post_id: joi.number().integer().min(1).required()
    })

    post = schema.validate(req.body)

    if(post.error) return res.status(422).json(post.error.details[0].message)
    
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

    var sql = "DELETE FROM user_post WHERE user_post.POST_ID = (?)" //note: must check if user owns this post
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

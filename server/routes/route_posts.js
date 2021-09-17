const express = require("express")
const router = express.Router()
const cors = require("cors")
const {client} = require("../server_connection")
const check_token = require("../middleware/check_token")
const Joi = require("joi")
const {nanoid} = require('nanoid')

// const edit_post = {
//     type: 'object', required: ['message', 'post_id'], additionalProperties: false,
//     properties: {
//         message: { type: 'string', minLength: 1, maxLength: 100 },
//         post_id: { type: 'integer' }
//     }
// }

// const delete_post = { type: 'integer' }

// const val_create_post = ajv.compile(create_post)
// const val_edit_post = ajv.compile(edit_post)
// const val_delete_post = ajv.compile(delete_post)


router.get("/posts", check_token(), async (req, res) => {
    try {
        // var posts = await client.keys("post:*")
        // console.log(posts)
        // return res.status(200).json(posts)
    }
    catch(e) {
        console.log("error in /posts route ==", e)
        return res.sendStatus(500)
    }
})

router.get("/user_posts/:page/:amount", check_token(), async (req, res) => {
    try {
        //we should do like at least 50 at a time
        //get the size here of list (prevent out of bounds)

        var posts = await client.lrange("user_post:"+req.userid, (req.params.amount*req.params.page), (req.params.amount*req.params.page)+req.params.amount-1)

        for(var i = 0; i < posts.length; i++) {
            console.log("test")
            console.log(await client.hgetall("post:"+posts[i]))
        }

        return res.status(200).json(posts)
    }
    catch(e) {
        console.log("error in /posts route ==", e)
        return res.sendStatus(500)
    }
})

router.post("/create_post", check_token(), async (req, res) => {
    try {
        res.set({'Accept': 'application/json', 'Content-Type': 'application/json'})

        //schema
        const schema = Joi.object({
            post: Joi.string().min(1).max(100).required()
        })

        //validate json
        console.log(req.body)
        var valid = schema.validate(req.body)
        if(valid.error) return res.status(422).json({"error": "invalid or missing key value"})

        var uid = nanoid(25)
        var data = {
            "userid": req.userid,
            "post": req.body.post
        }

        //create post
        for(const prop in data) await client.hset("post:"+uid, prop, data[prop])

        //connect post to user
        client.lpush("user_post:"+req.userid, uid)
        
        return res.status(200).json({"post": req.body.post})
    }
    catch(e) {
        console.log("error in /create_post route ==", e)
        return res.sendStatus(500)
    }
})

router.put("/edit_post", check_token(), async (req, res) => {
    try {
        res.set({'Accept': 'application/json', 'Content-Type': 'application/json'})

        val_edit_post(req.body)
        if(val_edit_post.errors) return res.status(422).json({"error": val_edit_post.errors[0].dataPath, "message": val_edit_post.errors[0].message})
        
        var sql = "UPDATE user_post SET Post = (?) WHERE user_post.POST_ID = (?) AND user_post.ID = (?)"
        var [rows, fields] = await connectsql.promise().query(sql, [req.body.message, req.body.post_id, req.id])
        res.sendStatus(200)
    }
    catch(e) {
        console.log("error in /edit_post route ==", e)
        return res.sendStatus(500)
    }
})

router.delete("/delete_post/:post", check_token(), async (req, res) => {
    try {
        val_delete_post(parseInt(req.params.post))
        if(val_delete_post.errors) return res.status(422).json({"error": val_delete_post.errors[0].message})

        const sql = "DELETE FROM user_post WHERE user_post.POST_ID = (?)" //note: must check if user owns this post
        var [rows, fields] = await connectsql.promise().query(sql, [req.params.post])
        res.sendStatus(200)
    }
    catch(e) {
        console.log("error in /delete_post route ==", e)
        return res.sendStatus(500)
    }
})

router.use(cors());

module.exports = router;

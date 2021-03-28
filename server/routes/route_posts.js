const express = require("express")
const router = express.Router()
const cors = require("cors")
const connectsql = require("../server_connection")
const check_token = require("../middleware/check_token")
const Ajv = require('ajv').default
const ajv = new Ajv()

const create_post = {
    type: 'object', required: ['message'], additionalProperties: false,
    properties: {
        message: { type: 'string', minLength: 1, maxLength: 100 } 
    }
}

const edit_post = {
    type: 'object', required: ['message', 'post_id'], additionalProperties: false,
    properties: {
        message: { type: 'string', minLength: 1, maxLength: 100 },
        post_id: { type: 'integer' }
    }
}

const delete_post = { type: 'integer' }

const val_create_post = ajv.compile(create_post)
const val_edit_post = ajv.compile(edit_post)
const val_delete_post = ajv.compile(delete_post)

  
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

router.post("/create_post", check_token(), async (req, res) => {
    try {
        res.set({'Accept': 'application/json', 'Content-Type': 'application/json'})

        val_create_post(req.body)
        if(val_create_post.errors) return res.status(422).json({"error": val_create_post.errors[0].dataPath, "message": val_create_post.errors[0].message})

        var sql = "INSERT INTO user_post(ID, Post) VALUES(?, ?)"
        var [rows, fields] = await connectsql.promise().query(sql, [req.id, req.body.message])
        return res.status(200).json({"post": req.body.message})
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

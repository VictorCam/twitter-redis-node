const express = require("express")
const router = express.Router()
const cors = require("cors")
const {client, sclient, rclient} = require("../server_connection")
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

router.get("/posts", check_token(), async (req, res) => {
    try {
        // console.log(req.userid)
        // rclient.hset(`spost:${req.userid}`,)
    }
    catch(e) {
        console.log("error in /posts route ==", e)
        return res.sendStatus(500)
    }
})

router.get("/user_posts", check_token(), async (req, res) => {
    try {
        var fuserid = await client.get(`username:${req.body.username}`)
        if(!fuserid) return res.status(200).json({"error": "user does not exist"})
            
        //note to self
        //check if req.body.username exists do diff logic
        //check if req.body.tags exists do diff logic
        //check if both req.body exists do diff logic

        sclient.connect()
        var results = await sclient.search("spost", `@userid:{${fuserid}} @tags:{${req.body.tags}}`, {limit: {first: 0, num: 50} })
        if(results == 0) return res.status(200).json({"results": "wOOF no posts found :("})
        return res.status(200).json({"results": results})
    }
    catch(e) {
        console.log("error in /posts route ==", e)
        return res.sendStatus(500)
    } 
    finally { sclient.disconnect() }
})

router.post("/post", check_token(), async (req, res) => {
    try {
        res.set({'Accept': 'application/json', 'Content-Type': 'application/json'})

        //schema
        // const schema = Joi.object({
        //     post: Joi.string().min(1).max(100).required()
        // })
        //validate json & make new post uid
        // var valid = schema.validate(req.body)
        // if(valid.error) return res.status(422).json({"error": "invalid or missing key value"})
        
        //uid for unique post id and for comment id
        var uid = nanoid(25)

        //create indexed post
        await rclient.hset(`spost:${uid}`, 
        [
            "userid", req.userid,
            "score", 0,
            "tags", req.body.tags,
            "simage", "test.png",
            "postname", req.body.postname
        ])

        //create post
        await client.hset(`post:${uid}`,
        [
            "filecontent", "test.png",
            "userid", req.userid,
            "views", 0,
            "postname", req.body.postname,
            "score", 0,
            "desc", req.body.desc,
            "tags", req.body.tags,
            "canComment", req.body.canComment,
            "canCommentImg", req.body.canCommentImg
        ])
        
        return res.status(200).json({"post": req.body.desc, "postid": uid})
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

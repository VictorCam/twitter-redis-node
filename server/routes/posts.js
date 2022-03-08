const express = require("express")
const router = express.Router()
const cors = require("cors")
const {client, sclient, rclient} = require("../server_connection")
const check_token = require("../middleware/check_token")
const Joi = require("joi")
const {nanoid} = require('nanoid')

// router.get("/post", check_token(), async (req, res) => {
//     try {
//         //WIP
//         //validation needed

//         let fuserid = await client.get(`username:${req.body.username}`)
//         if(!fuserid) return res.status(200).json({"error": "user does not exist"})
        
//         //get the 15 posts by rank
//         let posts = await client.zrevrange(`postl:${fuserid}`, 0, 15)
//         if(!posts) return res.status(200).json({"error": "user does not have any posts"})

//         //note to self
//         //check if req.body.username exists do diff logic
//         //check if req.body.tags exists do diff logic
//         //check if both req.body exists do diff logic

//         sclient.connect()
//         let results = await sclient.search("spost", `@userid:{${fuserid}} @tags:{${req.body.tags}}`, {limit: {first: 0, num: 50} })
//         if(results == 0) return res.status(200).json({"results": "wOOF no posts found :("})
//         return res.status(200).json({"results": results})
//     }
//     catch(e) {
//         console.log("error in /posts route ==", e)
//         return res.sendStatus(500)
//     } 
//     finally { sclient.disconnect() }
// })

router.post("/post", check_token(), async (req, res) => {
    try {
        res.set({'Accept': 'application/json', 'Content-Type': 'application/json'})

        //image is prefixed with .png or .jpg
        //name is between 1 to 100 characters
        //tags can be around 2000 characters
        //desc can be have between 0 to 5000 characters
        //can_comment can only be a 1 or 0
        //can_comment_img can only be a 1 or 0
        //can_comment_sticker can only be a 1 or 0
        //can_like can only be a 1 or 0
        //can_rehowl can only be a 1 or 0
        const schema = Joi.object().keys({
            image: Joi.string().min(1).max(100).required(),
            name: Joi.string().min(1).max(100).required(),
            tags: Joi.string().min(1).max(2000).required(),
            desc: Joi.string().min(0).max(5000).required(),
            can_comment: Joi.number().integer().min(0).max(1).required(),
            can_comment_img: Joi.number().integer().min(0).max(1).required(),
            can_comment_sticker: Joi.number().integer().min(0).max(1).required(),
            can_like: Joi.number().integer().min(0).max(1).required(),
            can_rehowl: Joi.number().integer().min(0).max(1).required()
        })

        //validate schema
        let valid = schema.validate(req.body)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "image") return res.status(200).json({"error": "image must be a string between 1 and 100 characters"})
            if(label === "name") return res.status(200).json({"error": "name must be a string between 1 and 100 characters"})
            if(label === "tags") return res.status(200).json({"error": "tags must be a string between 100 and 5000 characters"})
            if(label === "desc") return res.status(200).json({"error": "desc must be a string between 0 and 5000 characters"})
            if(label === "can_comment") return res.status(200).json({"error": "can_comment must be a number between 0 and 1"})
            if(label === "can_comment_img") return res.status(200).json({"error": "can_comment_img must be a number between 0 and 1"})
            if(label === "can_comment_sticker") return res.status(200).json({"error": "can_comment_sticker must be a number between 0 and 1"})
            if(label === "can_like") return res.status(200).json({"error": "can_like must be a number between 0 and 1"})
            if(label === "can_rehowl") return res.status(200).json({"error": "can_rehowl must be a number between 0 and 1"})
            return res.status(400).json({"error": "invalid user input"})
        }



        //uid for unique post id and for comment id
        let uid = nanoid(25)

        //create indexed post
        //rename this later
        // await rclient.hset(`spost:${uid}`, 
        // [
        //     "userid", req.userid,
        //     "score", 0,
        //     "tags", req.body.tags,
        //     "simage", req.body.image,
        //     "postname", req.body.postname
        // ])

        //create post and increment userid post_size

        await client.pipeline()
        .hset(`post:${uid}`,
        [
            "views", 0,
            "score", 0,
            "userid", req.userid,
            "image", req.body.image,
            "name", req.body.name,
            "desc", req.body.desc,
            "tags", req.body.tags,
            "can_comment", req.body.can_comment,
            "can_comment_img", req.body.can_comment_img,
            "can_comment_sticker", req.body.can_comment_sticker
        ])
        .zadd(`postl:${req.userid}`, Math.floor(Date.now() / 1000), uid)
        .exec()
        
        return res.status(200).json({"post": req.body.desc, "postid": uid})
    }
    catch(e) {
        console.log("error in /create_post route ==", e)
        return res.sendStatus(500)
    }
})

// router.put("/post", check_token(), async (req, res) => {
//     try {
//         res.set({'Accept': 'application/json', 'Content-Type': 'application/json'})

//     }
//     catch(e) {
//         console.log("error in /edit_post route ==", e)
//         return res.sendStatus(500)
//     }
// })

router.delete("/post/:postid", check_token(), async (req, res) => {
    try {
        res.set({'Accept': 'application/json', 'Content-Type': 'application/json'})

        //validate scheam
        const schema = Joi.object().keys({
            postid: Joi.string().min(1).max(25).required()
        })

        //validate schema
        let valid = schema.validate(req.params)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "postid") return res.status(200).json({"error": "postid must be a string between 1 and 25 characters"})
            return res.status(400).json({"error": "invalid user input"})
        }

        //check if post exists (if the post exists then the postl should exist (no need to check))
        let userid = await client.hget(`post:${req.params.postid}`, "userid")

        if(!userid) return res.status(200).json({"error": "post does not exist"})
        if(userid != req.userid) return res.status(200).json({"error": "you are not the user who created this post"})

        //delete post:postid and postl:userid
        let exists = await client.pipeline()
        .del(`post:${req.params.postid}`)
        .zrem(`postl:${userid}`, req.params.postid)
        .zcard(`postl:${userid}`)
        .exec()

        //update the index of the userid postl_index
        await client.hset(`userid:${userid}`, "postl_index", exists[2][1])
        return res.status(200).json({"status": "ok"})
    }
    catch(e) {
        console.log("error in /delete_post route ==", e)
        return res.sendStatus(500)
    }
})

router.use(cors());
module.exports = router;

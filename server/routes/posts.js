const express = require("express")
const router = express.Router()
const cors = require("cors")
const Joi = require("joi")
const base62 = require("base62/lib/ascii")
const {nanoid} = require('nanoid')

const tc = require("../middleware/try_catch")
const {client, sclient, rclient} = require("../server_connection")
const check_token = require("../middleware/check_token")

// router.get("/post", check_token(), async (req, res) => {
//     try {
//         //WIP
//         //validation needed

//         let fuserid = await client.get(`username:${req.body.username}`)
//         if(!fuserid) return res.status(200).json({"error": "user does not exist"})
        
//         //get the 15 posts by rank
//         let posts = await client.zrevrange(`ss:post:${fuserid}`, 0, 15)
//         if(!posts) return res.status(200).json({"error": "user does not have any posts"})

//         //note to self
//         //check if req.body.username exists do diff logic
//         //check if req.body.tags exists do diff logic
//         //check if both req.body exists do diff logic

//         sclient.connect()
//         let results = await sclient.search("spost", `@userid:{${fuserid}} @tags:{${req.body.tags}}`, {limit: {first: 0, num: 50} })
//         if(results == 0) return res.status(200).json({"error": "wOOF no posts found :("})
//         return res.status(200).json({"results": results})
//     }
//     catch(e) {
//         console.log("error in /posts route ==", e)
//         return res.sendStatus(500)
//     } 
//     finally { sclient.disconnect() }
// })

router.post("/post", check_token(), tc(async (req, res) => {
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

    //validate object
    const schema = Joi.object().keys({
        image: Joi.string().min(1).max(100).required().label("image must be between 1 and 100 characters"),
        name: Joi.string().min(1).max(100).required().label("name must be between 1 and 100 characters"),
        tags: Joi.string().min(1).max(2000).required().label("tags must be between 1 and 2000 characters"),
        desc: Joi.string().min(0).max(5000).required().label("desc must be between 0 and 5000 characters"),
        can_comment: Joi.number().integer().min(0).max(1).required().label("can_comment must be a 1 or 0"),
        can_comment_img: Joi.number().integer().min(0).max(1).required().label("can_comment_img must be a 1 or 0"),
        can_comment_sticker: Joi.number().integer().min(0).max(1).required().label("can_comment_sticker must be a 1 or 0"),
        can_like: Joi.number().integer().min(0).max(1).required().label("can_like must be a 1 or 0"),
        can_rehowl: Joi.number().integer().min(0).max(1).required().label("can_rehowl must be a 1 or 0")
    })
    let valid = schema.validate(req.body)
    if(valid.error) {
        console.log(valid.error.details)
        if(valid.error.details[0].type !== 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //uid for unique post id and for comment id
    let unix_ms = Date.now()
    let uid = base62.encode(unix_ms) + nanoid(parseInt(process.env.NANOID_LEN))

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
    .zadd(`ss:post:${req.userid}`, unix_ms, uid)
    .exec()
    
    return res.status(200).json({"post": req.body.desc, "postid": uid})
}))

// router.put("/post", check_token(), tc(async (req, res) => {
//         res.set({'Accept': 'application/json', 'Content-Type': 'application/json'})
// }))

router.delete("/post/:postid", check_token(), tc(async (req, res) => {
    //set headers
    res.set({'Accept': 'application/json', 'Content-Type': 'application/json'})

    //validate object
    const schema = Joi.object().keys({
        postid: Joi.string().min(1).max(25).required().label("postid must be between 1 and 25 characters")
    })
    let valid = schema.validate(req.params)
    if(valid.error) {
        if(valid.error.details[0].type !== 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //OPTIMIZE MAYBE??

    //check if post exists (if the post exists then the ss:post should exist (no need to check))
    let userid = await client.hget(`post:${req.params.postid}`, "userid")

    if(userid == null) return res.status(200).json({"error": "post does not exist"})
    if(userid != req.userid) return res.status(200).json({"error": "you are not the user who created this post"})

    //delete post:postid and ss:post:userid
    let exists = await client.pipeline()
    .del(`post:${req.params.postid}`)
    .zrem(`ss:post:${userid}`, req.params.postid)
    .zcard(`ss:post:${userid}`)
    .exec()

    return res.sendStatus(200)
}))

router.use(cors());
module.exports = router;
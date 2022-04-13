const express = require("express")
const router = express.Router()
const cors = require("cors")
const Joi = require("joi")
const base62 = require("base62/lib/ascii")
const {nanoid} = require('nanoid')

const tc = require("../middleware/try_catch")
const {client, sclient, rclient} = require("../server_connection")
const check_token = require("../middleware/check_token")
const { v_image, v_name, v_tags, v_desc, v_can_comment, v_can_comment_img, v_can_comment_sticker, v_can_like, v_can_rehowl, v_postid } = require("../middleware/validation")

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

    //validate object
    const schema = Joi.object().keys({
        "image": v_image.required(),
        "name": v_name.required(),
        "tags": v_tags.required(),
        "desc": v_desc.required(),
        "can_comment": v_can_comment.required(),
        "can_comment_img": v_can_comment_img.required(),
        "can_comment_sticker": v_can_comment_sticker.required(),
        "can_like": v_can_like.required(),
        "can_rehowl": v_can_rehowl.required()
    })
    let valid = schema.validate(req.body)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
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
        "postid": v_postid.required()
    })
    let valid = schema.validate(req.params)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check if post exists
    let userid = await client.hget(`post:${req.params.postid}`, "userid")
    
    //check if the userid is null which means the post does not exists
    if(userid == null) return res.status(200).json({"error": "post does not exist"})

    //check if the userid does not match since they are not the same user who created the post
    if(userid != req.userid) return res.status(200).json({"error": "you are not the user who created this post"})

    //delete post:postid and ss:post:userid
    let pipe = client.pipeline()
    pipe.del(`post:${req.params.postid}`)
    pipe.zrem(`ss:post:${userid}`, req.params.postid)
    let [[,post_del], [,ss_del]] = await pipe.exec()

    if(post_del == 0) return res.status(200).json({"error": "post does not exist"})

    return res.sendStatus(200)
}))

router.use(cors());
module.exports = router;
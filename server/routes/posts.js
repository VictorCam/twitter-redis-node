/*
 * Author: GitHub @VictorCam
 */

const express = require("express")
const router = express.Router()
const Joi = require("joi")
const base62 = require("base62/lib/ascii")
const {nanoid} = require('nanoid')

const tc = require("../middleware/try_catch")
const {client, sclient, rclient} = require("../server_connection")
const check_token = require("../middleware/check_token")
const { v_image, v_name, v_username, v_userid, v_tags, v_desc, v_can_comment, v_can_comment_img, v_can_comment_sticker, v_can_like, v_can_rehowl, v_postid } = require("../middleware/validation")
const pagination = require("../middleware/pagination")

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

//get many posts from a user
router.get("/post", check_token(), pagination(), tc(async (req, res) => {
    //set headers
    res.set({'Accept': 'application/json'})

    //validate object
    const schema = Joi.object().keys({
        "username": v_username,
        "userid": v_userid
    }).xor("username", "userid").label("username or userid is required")
    let valid = schema.validate(req.query)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //get username and check if the user exists and if the user is not the same as the one who is trying to unfollow
    let followid = null
    if(valid.value.userid) followid = valid.value.userid
    if(valid.value.username) followid = await client.get(`username:${valid.value.username}`)
    if(followid == null) return res.status(400).json({"error": "user does not exist"})

    //zrange posts from user
    let posts = await client.zrevrange(`ss:post:${followid}`, req.start, req.end)

    //hceck if posts is empty
    if(posts.length == 0) return res.status(200).json([])

    //for loop on posts
    let results = []
    let pipe = client.pipeline()
    for(let i = 0; i < posts.length; i++) {
        pipe.hgetall(`post:${posts[i]}`)
    }
    results = await pipe.exec()

    //format the posts
    let formatted_results = []
    for(let i = 0; i < results.length; i++) {
        if(results[i][1] != null) {
            let post = results[i][1]
            post.postid = posts[i]
            formatted_results.push(post)
        }
    }

    //return the posts
    return res.status(200).json(formatted_results)
}))

//get one post (probably rename the check_token middleware to be more of an auth_check function and another for just grabbing info if user has it)
//or (pass a string to make it an optional check LIKEWISE WITH THE API ABOVE!! (its a non compliant stateless rest api))
router.get("/post/:postid", tc(async (req, res) => {
    //set headers
    res.set({'Accept': 'application/json'})

    //validate object
    const schema = Joi.object().keys({
        "postid": v_postid.required()
    })
    let valid = schema.validate(req.params)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //later on add a method to check if we are allowed to view the post

    //check if the post exists
    let post = await client.hgetall(`post:${valid.value.postid}`)
    if(post == null) return res.status(200).json({"error": "post does not exist"})

    //check if the post is deleted

    return res.status(200).json(post)
}))

//post a post
router.post("/post", check_token(), tc(async (req, res) => {
    //set headers
    res.set({'Accept': 'application/json'})

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

    client.pipeline()
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
        "can_comment_sticker", req.body.can_comment_sticker,
        "timestamp", unix_ms
    ])
    .zadd(`ss:post:${req.userid}`, unix_ms, uid)
    .exec()
    
    return res.status(200).json({"post": req.body.desc, "postid": uid})
}))

//update a post
router.put("/post", check_token(), tc(async (req, res) => {
    //set headers
    res.set({'Accept': 'application/json'})

    //validate object
    const schema = Joi.object().keys({
        "postid": v_postid.required(),
        "image": v_image,
        "name": v_name,
        "tags": v_tags,
        "desc": v_desc,
        "can_comment": v_can_comment,
        "can_comment_img": v_can_comment_img,
        "can_comment_sticker": v_can_comment_sticker,
        "can_like": v_can_like,
        "can_rehowl": v_can_rehowl
    }).or('image', 'name', 'tags', 'desc', 'can_comment', 'can_comment_img', 'can_comment_sticker', 'can_like', 'can_rehowl').label("requires one field on a post to be updated")
    let valid = schema.validate(req.body)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check if the post exists and grab the userid
    let userid = await client.hget(`post:${valid.value.postid}`, "userid")

    //check if userid is null
    if(userid == null) return res.status(200).json({"error": "post does not exist"})

    //check if the user is allowed to edit the post
    if(userid != req.userid) return res.status(200).json({"error": "you are not allowed to edit this post"})

    //convert json to array and remove postid (should not be in hash)
    let obj = []
    delete valid.value.postid
    for(let key in valid.value) {
        obj.push(key)
        obj.push(valid.value[key])
    }

    //update the post and add postid back into object
    await client.hset(`post:${req.body.postid}`, obj)
    valid.value["postid"] = req.body.postid

    return res.status(200).json(valid.value)
}))

router.delete("/post/:postid", check_token(), tc(async (req, res) => {
    //set headers
    res.set({'Accept': 'application/json'})

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

module.exports = router
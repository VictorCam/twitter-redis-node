const express = require("express")
const router = express.Router()
const cors = require("cors")
const Joi = require("joi")
const {nanoid} = require('nanoid')
const base62 = require("base62/lib/ascii")

const check_token = require("../middleware/check_token")
const pagination = require("../middleware/pagination")
const tc = require("../middleware/try_catch")
const {client, sclient, rclient} = require("../server_connection")
const {v_postid, v_commentid, v_ncommentid, v_comment, v_type} = require("../middleware/validation")

/*
    * TODO:
    PRIVILEGE LEVELS - levels from 1 to 5
    LOCKED ACCOUNT - CANNOT BE VIEWED BY AVERAGE USER (unless privileged)
    DELETE AN ACCOUNT - CANNOT BE DONE BY AVERAGE USER (unless privileged)
*/

router.post("/comment", check_token(), tc(async (req, res) => {
    //set headers
    res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

    //validate object
    let schema = Joi.object().keys({ 
        "postid": v_postid.required(), 
        "comment": v_comment.required()
    })
    let valid = schema.validate(req.body)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check posts exists and get permissions
    let permissions = await client.hmget(`post:${req.body.postid}`, ["userid", "can_comment", "can_comment_img", "can_comment_sticker"])
    if(permissions[0] == null) return res.status(400).json({"error": "post not found"})

    //check post permissions
    if(permissions[1] == 0) return res.status(400).json({"error": "post does not allow comments"})
    if(permissions[2] == 0) return res.status(400).json({"error": "post does not allow images in the comments"})
    if(permissions[3] == 0) return res.status(400).json({"error": "post does not allow stickers in the comments"})

    //create commentid
    let unix_ms = Date.now()
    let gen_commentid = base62.encode(unix_ms) + nanoid(parseInt(process.env.NANOID_LEN))

    //create comment and comment lookup using ss:comment (timestamp) or ss:comment_likes (likes)
    await client.pipeline()
    .zadd(`ss:comment:${req.body.postid}`, unix_ms, gen_commentid)
    .zadd(`ss:comment_likes:${req.body.postid}`, 0, gen_commentid)
    .hset(`comment:${gen_commentid}`, ["userid", req.userid, "comment", req.body.comment, "postid", req.body.postid, "ss:commentid", req.body.postid, "likes", 0, "is_updated", 0, "timestamp", unix_ms])
    .exec()

    return res.status(200).json({"comment": req.body.comment, "commentid": gen_commentid})
}))

router.post("/ncomment", check_token(), tc(async (req, res) => {
    //set headers
    res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

    //validate object
    let schema = Joi.object().keys({
        "commentid": v_commentid.required(),
        "comment": v_comment.required()
    })
    let valid = schema.validate(req.body)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //get the comment comment and ss:comment length
    let pipe = client.pipeline()
    pipe.hmget(`comment:${req.body.commentid}`, `postid`)
    pipe.zcard(`ss:ncomment:${req.body.commentid}`)
    let [[,postid], [,ncomment_len]] = await pipe.exec()

    //check if comment exists
    if(postid[0] == null) return res.status(400).json({"error": "comment not found"})

    //check if the post exists
    let post = await client.hmget(`post:${postid[0]}`, ["userid", "can_comment", "can_comment_img", "can_comment_sticker"])
    if(post[0] == null) return res.status(400).json({"error": "post does not exist"})

    //check post settings and if comments have reached the limit of 500
    if(post[1] == 0) return res.status(400).json({"error": "post does not allow comments"})
    if(post[2] == 0) return res.status(400).json({"error": "post does not allow images in the comments"})
    if(post[3] == 0) return res.status(400).json({"error": "post does not allow stickers in the comments"})
    if(ncomment_len >= 500) return res.status(400).json({"error": "comment limit reached"})

    //create ncommentid
    let unix_ms = Date.now()
    let gen_ncommentid = base62.encode(unix_ms) + nanoid(parseInt(process.env.NANOID_LEN))
    
    //create ncomment and ncomment lookup using ss:ncomment (timestamp)
    await client.pipeline()
    .zadd(`ss:ncomment:${req.body.commentid}`, unix_ms, gen_ncommentid)
    .hset(`ncomment:${gen_ncommentid}`, ["userid", req.userid, "ncomment", req.body.comment, "ss:ncommentid", req.body.commentid, "commentid", req.body.commentid, "likes", 0, "is_updated", 0])
    .exec()
    
    return res.status(200).json({"comment": req.body.comment, "ncommentid": gen_ncommentid})
}))

router.get("/comment", pagination(), tc(async (req, res) => {
    //set headers
    res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

    //validate object
    let schema = Joi.object().keys({
        "postid": v_postid.required(), 
        "type": v_type.required()
    })
    let valid = schema.validate(req.query)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check if we are requesting the like sorted set or the regular sorted set and if the length is 0 or not
    let pipe = client.pipeline()
    if("like" == req.query.type) {
        pipe.exists(`ss:comment_likes:${req.query.postid}`)
        pipe.zrevrange(`ss:comment_likes:${req.query.postid}`, req.start, req.end)
    }
    else {
        pipe.exists(`ss:comment_likes:${req.query.postid}`)
        pipe.zrange(`ss:comment:${req.query.postid}`, req.start, req.end)
    }
    let [[,exists], [,comment_ids]] = await pipe.exec()

    //check if the post exists AND check if the zrange is empty
    if(exists == 0) return res.status(400).json({"error": "post does not exist"})
    if(comment_ids.length == 0) return res.status(200).json([])

    //pipeline all comments then execute (no destructuring)
    let pipe2 = client.pipeline()
    for (let i = 0; i < comment_ids.length; i++) {
        pipe2.hgetall(`comment:${comment_ids[i]}`)
    }
    let comments = await pipe2.exec()

    for(let i = 0; i < comments.length; i++) {
        comments[i] = comments[i][1]
        comments[i]["commentid"] = comment_ids[i]
        delete comments[i]["ss:commentid"]
        delete comments[i]["postid"]
    }
    
    return res.status(200).json(comments)
}))

router.get("/ncomment", pagination(), tc(async (req, res) => {
    //set headers
    res.set({'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

    //validate object
    let schema = Joi.object().keys({
        "commentid": v_commentid.required()
    })
    let valid = schema.validate(req.query)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check if the comment exists and get a range of ncomments ids
    let pipe = await client.pipeline()
    pipe.exists(`ss:ncomment:${req.query.commentid}`)
    pipe.zrange(`ss:ncomment:${req.query.commentid}`, req.start, req.end)
    let [[,exists], [,ncomment_ids]] = await pipe.exec()

    //check if the post exists AND check if the zrange is empty
    if(exists == 0) return res.status(400).json({"error": "comment does not exist"})
    if(ncomment_ids.length == 0) return res.status(200).json({"ncomments": []})

    //pipeline all comments then execute (no destructuring)
    let pipe2 = client.pipeline()
    for (let i = 0; i < ncomment_ids.length; i++) {
        pipe2.hgetall(`ncomment:${ncomment_ids[i]}`)
    }
    let ncomments = await pipe2.exec()

    //format and remove certain keys
    for(let i = 0; i < ncomments.length; i++) {
        ncomments[i] = ncomments[i][1]
        ncomments[i]["ncommentid"] = ncomment_ids[i]
        delete ncomments[i]["ss:ncommentid"]
        delete ncomments[i]["commentid"]
    }

    return res.status(200).json(ncomments)
}))

router.get("/comment/:commentid", tc(async (req, res) => {
    //set headers
    res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

    //validate object
    let schema = Joi.object().keys({
        "commentid": v_commentid.required()
    })
    let valid = schema.validate(req.params)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //get comment
    let comment = await client.hgetall(`comment:${req.params.commentid}`)

    //if null return ncomment does not exist
    if(comment == null) return res.status(400).json({"error": "comment does not exist"})

    return res.status(200).json(comment)
}))

router.get("/ncomment/:ncommentid", tc(async (req, res) => {
    //set headers
    res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

    //validate object
    let schema = Joi.object().keys({
        "ncommentid": v_ncommentid.required()
    })
    let valid = schema.validate(req.params)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //get ncomment
    let ncomment = await client.hgetall(`ncomment:${req.params.ncommentid}`)

    //if {}, return ncomment does not exist
    if(ncomment == null) return res.status(400).json({"error": "ncomment does not exist"})

    //return ncommentid and userid
    return res.status(200).json(ncomment)
}))

router.put("/comment", check_token(), tc(async (req, res) => {
    //set headers
    res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})
    
    //validate object
    let schema = Joi.object().keys({
        "commentid": v_commentid.required(), 
        "comment": v_comment.required()
    })
    let valid = schema.validate(req.body)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check if comment exists and get userid from the comment
    let userid = await client.hget(`comment:${req.body.commentid}`, "userid")
    if(userid == null) return res.status(400).json({"error": "comment does not exist"})

    //check if the userid is the same one who is modifying the comment
    if(req.userid != userid) return res.status(400).json({"error": "you do not own this comment"})

    //update comment
    await client.hset(`comment:${req.body.commentid}`, ["comment", req.body.comment, "is_updated", 1])

    return res.status(200).json({"comment": req.body.comment, "commentid": req.body.commentid})
}))

router.put("/ncomment", check_token(), tc(async (req, res) => {
    //set headers
    res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

    //validate object
    let schema = Joi.object().keys({
        "ncommentid": v_ncommentid.required(),
        "comment": v_comment.required()
    })
    let valid = schema.validate(req.body)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check if ncomment exists and get userid from the ncomment
    let userid = await client.hget(`ncomment:${req.body.ncommentid}`, "userid")
    if(userid == null) return res.status(400).json({"error": "ncommentid does not exist"})

    //check if the userid is the same one who is modifying the ncomment
    if(req.userid != userid) return res.status(400).json({"error": "you do not own this comment"})

    //update ncomment
    await client.hset(`ncomment:${req.body.ncommentid}`, ["comment", req.body.comment, "is_updated", 1])

    return res.status(200).json({"comment": req.body.comment, "ncommentid": req.body.ncommentid})
}))

router.delete("/comment/:commentid", check_token(), tc(async (req, res) => {
    //set headers
    res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

    //validate object
    let schema = Joi.object().keys({
        "commentid": v_commentid.required()
    })
    let valid = schema.validate(req.params)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check if comment exists and get userid from the comment
    let comment = await client.hmget(`comment:${req.params.commentid}`, "userid", "ss:commentid")
    if(comment[0] == null) return res.status(400).json({"error": "commentid does not exist"})

    //check if the userid is the same one who is deleting the comment
    if(req.userid != comment[0]) return res.status(400).json({"error": "you do not own this comment"})

    //delete comment and sorted sets associated with it
    await client.pipeline()
    .del(`comment:${req.params.commentid}`)
    .zrem(`ss:comment:${comment[1]}`, req.params.commentid)
    .zrem(`ss:comment_likes:${comment[1]}`, req.params.commentid)
    .exec()

    return res.sendStatus(200)
}))


router.delete("/ncomment/:ncommentid", check_token(), tc(async (req, res) => {
    //set headers
    res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})
    
    //validate object
    let schema = Joi.object().keys({
        "ncommentid": v_ncommentid.required()
    })
    let valid = schema.validate(req.params)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check if ncomment exists and get userid from the ncomment
    let ncomment = await client.hmget(`ncomment:${req.params.ncommentid}`, ["userid", "ss:ncommentid"])
    if(ncomment[0] == null) return res.status(400).json({"error": "ncommentid does not exist"})

    //check if the userid is the same one who is deleting the comment
    if(req.userid != ncomment[0]) return res.status(400).json({"error": "you do not own this comment"})

    //delete ncomment and sorted sets associated with it
    await client.pipeline()
    .del(`ncomment:${req.params.ncommentid}`)
    .zrem(`ss:ncomment:${ncomment[1]}`, req.params.ncommentid)
    .exec()

    return res.sendStatus(200)
}))

//route to like a comment
router.post("/comment/like/:commentid", check_token(), tc(async (req, res) => {
    //set headers
    res.set("Content-Type", "application/json")

    //validate object
    const schema = Joi.object().keys({
        "commentid": v_commentid.required(),
    })
    let valid = schema.validate(req.params)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check if comment exists and if the user has already liked it
    let comment = await client.exists(`comment:${valid.value.commentid}`)

    //check if comment is 0 (which means it does not exist)
    if(comment == 0) return res.status(400).json({"error": "commentid does not exist"})
    
    //unix timestamp
    let unix_ms = Date.now()

    //check if the user already liked the comment
    let like = await client.zadd(`ss:my_comment_likes:${req.userid}`, unix_ms, valid.value.commentid)

    //if the user already liked the comment, return an error
    if(like == 0) return res.status(400).json({"error": "you have already liked this comment"})

    //increment likes
    let pipe2 = client.pipeline()
    pipe2.zincrby(`ss:comment_likes:${valid.value.commentid}`, 1, valid.value.commentid)
    pipe2.hincrby(`comment:${valid.value.commentid}`, "likes", 1)
    await pipe2.exec()

    return res.sendStatus(200)
}))

router.post("/comment/unlike/:commentid", check_token(), tc(async (req, res) => {
    //set headers
    res.set("Content-Type", "application/json")

    //validate object
    const schema = Joi.object().keys({
        "commentid": v_commentid.required(),
    })
    let valid = schema.validate(req.params)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check if the user already liked the comment
    let remove_like = await client.zrem(`ss:my_comment_likes:${req.userid}`, valid.value.commentid)

    //if the user did not like the comment, return an error
    if(remove_like == 0) return res.status(400).json({"error": "you have not liked this comment"})

    let pipe2 = client.pipeline()
    pipe2.zincrby(`ss:comment_likes:${valid.value.commentid}`, -1, valid.value.commentid)
    pipe2.hincrby(`comment:${valid.value.commentid}`, "likes", -1)
    await pipe2.exec()

    return res.sendStatus(200)
}))

router.post("/ncomment/like/:ncommentid", check_token(), tc(async (req, res) => {
    //set headers
    res.setHeader("Content-Type", "application/json")

    //validate object
    const schema = Joi.object().keys({
        "ncommentid": v_ncommentid.required(),
    })
    let valid = schema.validate(req.params)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check if ncomment exists and if the user has already liked it
    let ncomment = await client.exists(`ncomment:${valid.value.ncommentid}`)

    //check if ncomment is 0 (which means it does not exist)
    if(ncomment == 0) return res.status(400).json({"error": "ncommentid does not exist"})

    //unix timestamp
    let unix_ms = Date.now()

    //check if the user already liked the comment
    let like = await client.zadd(`ss:my_ncomment_likes:${req.userid}`, unix_ms, valid.value.ncommentid)

    //if the user already liked the comment, return an error
    if(like == 0) return res.status(400).json({"error": "you have already liked this comment"})

    //increment likes
    await client.hincrby(`ncomment:${valid.value.ncommentid}`, "likes", 1)

    return res.sendStatus(200)
}))

router.post("/ncomment/unlike/:ncommentid", check_token(), tc(async (req, res) => {
    //set headers
    res.set("Content-Type", "application/json")

    //validate object
    const schema = Joi.object().keys({
        "ncommentid": v_ncommentid.required(),
    })
    let valid = schema.validate(req.params)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check if the user already liked the comment
    let remove_like = await client.zrem(`ss:my_ncomment_likes:${req.userid}`, valid.value.ncommentid)

    //if the user did not like the comment, return an error
    if(remove_like == 0) return res.status(400).json({"error": "you have not liked this comment"})

    //increment likes
    await client.hincrby(`ncomment:${valid.value.ncommentid}`, "likes", -1)

    return res.sendStatus(200)
}))

router.use(cors())
module.exports = router
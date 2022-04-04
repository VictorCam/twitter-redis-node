const express = require("express")
const router = express.Router()
const cors = require("cors")
const Joi = require("joi")
const dayjs = require('dayjs')
const {nanoid} = require('nanoid')
const base62 = require("base62/lib/ascii")

const check_token = require("../middleware/check_token")
const pagination = require("../middleware/pagination")
const tc = require("../middleware/try_catch")
const {client, sclient, rclient} = require("../server_connection")
const {postid, commentid, ncommentid, comment, type} = require("../middleware/validation")

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
        "postid": postid.required(), 
        "comment": comment.required()
    })
    let valid = schema.validate(req.body)
    if(valid.error) {
        if(valid.error.details[0].type !== 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check posts exists and get permissions
    let cperm = await client.hmget(`post:${req.body.postid}`, ["userid", "can_comment", "can_comment_img", "can_comment_sticker"])
    if(!cperm[0]) return res.status(400).json({"error": "post does not exist"})

    //check post permissions
    if(!cperm[1]) return res.status(400).json({"error": "post does not allow comments"})
    if(!cperm[2]) return res.status(400).json({"error": "post does not allow images in the comments"})
    if(!cperm[3]) return res.status(400).json({"error": "post does not allow stickers in the comments"})

    //create commentid
    let unix_ms = dayjs().valueOf()
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
        "commentid": commentid.required(),
        "comment": comment.required()
    })
    let valid = schema.validate(req.body)
    if(valid.error) {
        if(valid.error.details[0].type !== 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //get the comment comment and ss:comment length
    let cidlist = await client.pipeline()
    .hmget(`comment:${req.body.commentid}`, `postid`)
    .zcard(`ss:ncomment:${req.body.commentid}`)
    .exec()
    if(!cidlist[0][1]) return res.status(400).json({"error": "comment does not exist"})

    //check if the post exists
    let post = await client.hmget(`post:${cidlist[0][1]}`, ["userid", "can_comment", "can_comment_img", "can_comment_sticker"])
    if(!post[0]) return res.status(400).json({"error": "post does not exist"})

    //check post settings and if comments have reached the limit of 500
    if(!post[1]) return res.status(400).json({"error": "post does not allow comments"})
    if(!post[2]) return res.status(400).json({"error": "post does not allow images in the comments"})
    if(!post[3]) return res.status(400).json({"error": "post does not allow stickers in the comments"})
    if(cidlist[1] >= 500) return res.status(400).json({"error": "comment has reached max reply limit"})

    //create ncommentid
    let unix_ms = dayjs().valueOf()
    let gen_ncommentid = base62.encode(unix_ms) + nanoid(parseInt(process.env.NANOID_LEN))
    
    //create ncomment and ncomment lookup using ss:ncomment (timestamp)
    await client.pipeline()
    .zadd(`ss:ncomment:${req.body.commentid}`, unix_ms, gen_ncommentid)
    .hset(`ncomment:${gen_ncommentid}`, 
    ["userid", req.userid,
    "ncomment", req.body.comment,
    "ss:ncommentid", req.body.commentid,
    "commentid", req.body.commentid,
    "likes", 0,
    "is_updated", 0])
    .exec()
    
    return res.status(200).json({"comment": req.body.comment, "ncommentid": gen_ncommentid})
}))

router.get("/comment", pagination(), tc(async (req, res) => {
    //set headers
    res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

    //validate object
    let schema = Joi.object().keys({
        "postid": postid.required(), 
        "type": type.required()
    })
    let valid = schema.validate(req.query)
    if(valid.error) {
        if(valid.error.details[0].type !== 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check if we are requesting the like sorted set or the regular sorted set and if the length is 0 or not
    let pipe = client.pipeline()
    if("like" === req.query.type) {
        pipe.exists(`ss:comment_likes:${req.query.postid}`)
        pipe.zrevrange(`ss:comment_likes:${req.query.postid}`, req.start, req.end)
    }
    else {
        pipe.exists(`ss:comment_likes:${req.query.postid}`)
        pipe.zrange(`ss:comment:${req.query.postid}`, req.start, req.end)
    }
    let cdata = await pipe.exec()

    //check if the post exists AND check if the zrange is empty
    if(!cdata[0][1]) return res.status(400).json({"error": "post does not exist"})
    if(cdata[1].length === 0) return res.status(200).json([])

    //pipeline all comments then execute
    let pipe2 = client.pipeline()
    for (let i = 0; i < cdata[1][1].length; i++) {
        pipe2.hgetall(`comment:${cdata[1][1][i]}`)
    }
    let comments = await pipe2.exec()

    for(let i = 0; i < comments.length; i++) {
        comments[i] = comments[i][1]
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
        "commentid": commentid.required()
    })
    let valid = schema.validate(req.query)
    if(valid.error) {
        if(valid.error.details[0].type !== 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check if the comment exists and get a range of ncomments ids
    let range = await client.pipeline()
    .exists(`ss:ncomment:${req.query.commentid}`)
    .zrevrange(`ss:ncomment:${req.query.commentid}`, req.start, req.end)
    .exec()

    //check if the post exists AND check if the zrange is empty
    if(!range[0][1]) return res.status(400).json({"error": "post does not exist"})
    if(range[1][1].length === 0) return res.status(200).json([])

    //pipeline all comments then execute
    let pipe = client.pipeline()
    for (let i = 0; i < range[1][1].length; i++) {
        pipe.hgetall(`ncomment:${range[1][1][i]}`)
    }
    let ncomments = await pipe.exec()

    //format and remove certain keys
    for(let i = 0; i < ncomments.length; i++) {
        ncomments[i] = ncomments[i][1]
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
        "commentid": commentid.required()
    })
    let valid = schema.validate(req.params)
    if(valid.error) {
        if(valid.error.details[0].type !== 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //get and check if commentid exists
    let comment = await client.hgetall(`comment:${req.params.commentid}`)
    if(!comment.hasOwnProperty('userid')) return res.status(400).json({"error": "commentid does not exist"})

    return res.status(200).json(comment)
}))

router.get("/ncomment/:ncommentid", tc(async (req, res) => {
    //set headers
    res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

    //validate object
    let schema = Joi.object().keys({
        "ncommentid": ncommentid.required()
    })
    let valid = schema.validate(req.params)
    if(valid.error) {
        if(valid.error.details[0].type !== 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //get and check if ncommentid exists
    let ncomment = await client.hgetall(`ncomment:${req.params.ncommentid}`)
    if(!ncomment.hasOwnProperty('userid')) return res.status(400).json({"error": "ncommentid does not exist"})

    //return ncommentid and userid
    return res.status(200).json(ncomment)
}))

router.put("/comment", check_token(), tc(async (req, res) => {
    //set headers
    res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})
    
    //validate object
    let schema = Joi.object().keys({
        "commentid": commentid.required(), 
        "comment": comment.required()
    })
    let valid = schema.validate(req.body)
    if(valid.error) {
        if(valid.error.details[0].type !== 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }
    
    //check if comment exists and get userid from the comment
    let userid = await client.hget(`comment:${req.body.commentid}`, "userid")
    if(!userid) return res.status(400).json({"error": "commentid does not exist"})

    //check if the userid is the same one who is modifying the comment
    if(req.userid != userid) return res.status(400).json({"error": "you do not own this comment"})

    //update comment
    await client.hmset(`comment:${req.body.commentid}`, ["comment", req.body.comment, "is_updated", 1])

    return res.status(200).json({"comment": req.body.comment, "commentid": req.body.commentid})
}))

router.put("/ncomment", check_token(), tc(async (req, res) => {
    //set headers
    res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

    //validate object
    let schema = Joi.object().keys({
        "ncommentid": ncommentid.required(),
        "comment": comment.required()
    })
    let valid = schema.validate(req.body)
    if(valid.error) {
        if(valid.error.details[0].type !== 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check if ncomment exists and get userid from the ncomment
    let userid = await client.hget(`ncomment:${req.body.ncommentid}`, "userid")
    if(!userid) return res.status(400).json({"error": "ncommentid does not exist"})
    
    //check if the userid is the same one who is modifying the ncomment
    if(req.userid != userid) return res.status(400).json({"error": "you do not own this comment"})

    //update ncomment
    await client.hmset(`ncomment:${req.body.ncommentid}`, ["comment", req.body.comment, "is_updated", 1])

    return res.status(200).json({"comment": req.body.comment, "ncommentid": req.body.ncommentid})
}))

router.delete("/comment/:commentid", check_token(), tc(async (req, res) => {
    //set headers
    res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

    //validate object
    let schema = Joi.object().keys({
        "commentid": commentid.required()
    })
    let valid = schema.validate(req.params)
    if(valid.error) {
        if(valid.error.details[0].type !== 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check if comment exists and get userid from the comment
    let comment = await client.hmget(`comment:${req.params.commentid}`, "userid", "ss:commentid")
    if(!comment[0]) return res.status(400).json({"error": "commentid does not exist"})

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
        "ncommentid": ncommentid.required()
    })
    let valid = schema.validate(req.params)
    if(valid.error) {
        if(valid.error.details[0].type !== 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check if ncomment exists and get userid from the ncomment
    let ncomment = await client.hmget(`ncomment:${req.params.ncommentid}`, ["userid", "ss:ncommentid"])
    if(!ncomment[0]) return res.status(400).json({"error": "ncommentid does not exist"})

    //check if the userid is the same one who is deleting the comment
    if(req.userid != ncomment[0]) return res.status(400).json({"error": "you do not own this comment"})

    //delete ncomment and sorted sets associated with it
    await client.pipeline()
    .del(`ncomment:${req.params.ncommentid}`)
    .zrem(`ss:ncomment:${ncomment[1]}`, req.params.ncommentid)
    .exec()

    return res.sendStatus(200)
}))

//RETURN

// router.post("/comment/like/:commentid", check_token(), tc(async (req, res) => {
//     //set headers
//     res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

//     //validate object
//     let schema = Joi.object().keys({
//         commentid: commentid
//     })
//     let valid = schema.validate(req.params)
//     if(valid.error) {
//         if(valid.error.details[0].type !== 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
//         return res.status(400).json({"error": "invalid user input"})
//     }

//     //OPTIMIZATION HERE

//     //check comment exists
//     let comment = await client.hmget(`comment:${req.params.commentid}`, "userid", "ss:commentid")

//     //add the the sorted set and see the result
//     let result = await client.sadd(`ss:comment_likes:${req.userid}`, req.params.commentid)
//     if(result == 0) return res.status(400).json({"error": "you have already liked this comment"})

//     //like the comment_likes sorted set and comment
//     await client.pipeline()
//     .zincrby(`ss:comment_likes:${comment[1]}`, 1, req.params.commentid)
//     .hincrby(`comment:${comment[0]}`, "likes", 1)
//     .exec()

//     return res.sendStatus(200)
// }))

// router.post("/ncomment/like/:ncommentid", check_token(), tc(async (req, res) => {
//     //set headers
//     res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

//     //validate object
//     let schema = Joi.object().keys({
//         ncommentid: ncommentid
//     })
//     let valid = schema.validate(req.params)
//     if(valid.error) {
//         if(valid.error.details[0].type !== 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
//         return res.status(400).json({"error": "invalid user input"})
//     }

//     //check ncomment exists
//     let ncomment = await client.hmget(`ncomment:${req.params.ncommentid}`, "userid", "ss:ncommentid")

//     //add the the sorted set and see the result
//     let result = await client.sadd(`ss:ncomment:${req.userid}`, req.params.ncommentid)
// }))

router.use(cors())
module.exports = router
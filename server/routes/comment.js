const express = require("express")
const router = express.Router()
const cors = require("cors")
const {client, sclient, rclient} = require("../server_connection")
const check_token = require("../middleware/check_token")
const pagination = require("../middleware/pagination")
const Joi = require("joi")
const {nanoid} = require('nanoid')

//check if you are an admin of certain privileges if so you are able to delete anything

router.post("/comment", check_token(), async (req, res) => {
    try {
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        let schema = Joi.object().keys({
            postid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required(),
            comment: Joi.string().min(1).max(1000).required()
        })

        let valid = schema.validate(req.body)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "postid") return res.status(400).json({"error": "Invalid postid"})
            if(label === "comment") return res.status(400).json({"error": "Comment should be between 1 to 1000 characters"})
            return res.status(400).json({"error": "invalid user input"})
        }

        let cperm = await client.hmget(`post:${req.body.postid}`, ["userid", "can_comment", "can_comment_img", "can_comment_sticker"])

        if(!cperm[0]) return res.status(400).json({"error": "post does not exist"})
        if(cperm[0] != req.userid) {
            if(!cperm[1]) return res.status(400).json({"error": "post does not allow comments"})
            if(!cperm[2]) return res.status(400).json({"error": "post does not allow images in the comments"})
            if(!cperm[3]) return res.status(400).json({"error": "post does not allow images in the comments"})
        }

        let commentid = nanoid(25)

        await client.pipeline()
        .zadd(`commentl:${req.body.postid}`, Math.floor(Date.now() / 1000), commentid)
        .zadd(`ss:comment_likes:${req.body.postid}`, 0, commentid)
        .hset(`comment:${commentid}`, ["userid", req.userid, "comment", req.body.comment, "postid", req.body.postid, "likes", 0, "isupdated", 0, "timestamp", Math.floor(Date.now() / 1000)])
        .exec()

        return res.status(200).json({"comment": req.body.comment, "commentid": commentid})
    } 
    catch (e) {
        console.log("error in /comment route ==", e)
        return res.sendStatus(500)   
    }
})


router.post("/ncomment", check_token(), async (req, res) => {
    try {
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        let schema = Joi.object().keys({
            postid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required(),
            commentid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required(),
            comment: Joi.string().min(1).max(1000).required()
        })

        let valid = schema.validate(req.body)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "postid") return res.status(400).json({"error": "Invalid postid"})
            if(label === "commentid") return res.status(400).json({"error": "Invalid commentid"})
            if(label === "comment") return res.status(400).json({"error": "Comment should be between 1 to 1000 characters"})
            return res.status(400).json({"error": "invalid user input"})
        }

        let cidlist = await client.pipeline()
        .hmget(`post:${req.body.postid}`, ["userid", "can_comment", "can_comment_img", "can_comment_sticker"])
        .hmget(`comment:${req.body.commentid}`, `postid`)
        .zcard(`ss:ncomment:${req.body.commentid}`)
        .exec()

        if(!cidlist[0][1][0]) return res.status(400).json({"error": "post does not exist"})
        if(cidlist[0][1][0] != req.userid) {
            if(!cidlist[0][1][1]) return res.status(400).json({"error": "post does not allow comments"})
            if(!cidlist[0][1][2]) return res.status(400).json({"error": "post does not allow images in the comments"})
            if(!cidlist[0][1][3]) return res.status(400).json({"error": "post does not allow images in the comments"})
        }

        if(cidlist[1][1][0] != req.body.postid) return res.status(400).json({"error": "commentid does not exist or postid has no relationship with commentid"})
        if(cidlist[2][1] >= 500) return res.status(400).json({"error": "comment has reached max reply limit"})

        let ncommentid = nanoid(25)
        
        await client.pipeline()
        .zadd(`ss:ncomment:${req.body.commentid}`, Math.floor(Date.now() / 1000), ncommentid)
        .hset(`ncomment:${ncommentid}`, ["userid", req.userid, "ncomment", req.body.comment, "ss:ncommentid", req.body.commentid, "likes", 0, "isupdated", 0])
        .exec()
        
        return res.status(200).json({"comment": req.body.comment, "ncommentid": ncommentid, "ncomments": req.body.commentid})
    } 
    catch (e) {
        console.log("error in /ncomment route ==", e)
        return res.sendStatus(500)
    }
})

//allow stickers as well like in telegram!

router.get("/comment", pagination(), async (req, res) => {
    try {
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        let schema = Joi.object().keys({
            postid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required(),
            type: Joi.string().valid("like", "reg").required()
        })

        //validate schema
        let valid = schema.validate(req.query)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "postid") return res.status(400).json({"error": "Invalid postid"})
            if(label === "type") return res.status(400).json({"error": "Invalid type"})
            return res.status(400).json({"error": "invalid user input"})
        }

        //check the size of the commentl and check if we reached the end of the list
        let commentl_size = await client.zcard("commentl:"+req.query.postid)
        if(req.start >= commentl_size) return res.status(400).json({"error": "you have no more posts to see"})

        //check if we are requesting the like sorted set or the regular sorted set and if the length is 0 or not
        let cidlist = ("like" === req.query.type) ? 
        await client.zrevrange(`ss:comment_likes:${req.query.postid}`, req.start, req.end) 
        : await client.zrange(`commentl:${req.query.postid}`, req.start, req.end)
        if(cidlist.length === 0) return res.status(400).json({"error": "postid does not exist"})

        //pipeline all comments and execute
        let pipe = client.pipeline()
        for (let i = 0; i < cidlist.length; i++) { 
            pipe.hgetall(`comment:${cidlist[i]}`)
        }
        let cdata = await pipe.exec()

        //format the data
        let commentlist = []
        for (let i = 0; i < cidlist.length; i++) {
            let userinfo = await client.hmget(`userid:${cdata[0][1].userid}`, "icon", "username", "icon_frame")
            cdata[i][1]["commentid"] = cidlist[i]
            cdata[i][1]["icon"] = userinfo[0]
            cdata[i][1]["username"] = userinfo[1]
            cdata[i][1]["icon_frame"] = userinfo[2]
            commentlist.push(cdata[i][1])
        }
        
        return res.status(200).json(commentlist)
    }
    catch (e) {
        console.log("error in /comment route ==", e)
        return res.sendStatus(500)   
    }
})

router.get("/ncomment", pagination(), async (req, res) => {
    try {
        res.set({'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        let schema = Joi.object().keys({
            commentid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required()
        })

        let valid = schema.validate(req.query)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "commentid") return res.status(400).json({"error": "Invalid commentid"})
            return res.status(400).json({"error": "invalid user input"})
        }

        //check the size of the commentl
        let ss_ncomment_size = await client.zcard(`ss:ncomment:${req.query.commentid}`)
        
        //CHECK IF THE NCOMMENT SS WAS DELETED

        //check if start >= ss:ncomment_size 
        if(req.start >= ss_ncomment_size) return res.status(400).json({"error": "no more comments to see"})
        
        let cidlist = await client.zrange(`ss:ncomment:${req.query.commentid}`, req.start, req.end)

        if(cidlist.length === 0) return res.status(400).json({"error": "commentid does not exist"})

        let pipe = client.pipeline()
        for (let i = 0; i < cidlist.length; i++) { 
            pipe.hgetall(`ncomment:${cidlist[i]}`)
        }
        let cdata = await pipe.exec()

        //maybe could make concurrent
        //https://dev.to/apurbostarry/how-to-make-concurrent-api-calls-in-nodejs-35b8
        let commentlist = []
        for (let i = 0; i < cidlist.length; i++) {
            let userinfo = await client.hmget(`userid:${cdata[i][1].userid}`, "icon", "username", "icon_frame")
            cdata[i][1]["ncommentid"] = cidlist[i]
            cdata[i][1]["icon"] = userinfo[0]
            cdata[i][1]["username"] = userinfo[1]
            cdata[i][1]["icon_frame"] = userinfo[2]
            commentlist.push(cdata[i][1])
        }
        
        return res.status(200).json(commentlist)
    }
    catch (e) {
        console.log("error in /ncomment route ==", e)
        return res.sendStatus(500)   
    }
})

router.get("/comment/:commentid", async (req, res) => {
    try {
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        let schema = Joi.object().keys({
            commentid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required()
        })

        //validate schema
        let valid = schema.validate(req.params)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "commentid") return res.status(400).json({"error": "Invalid commentid"})
            return res.status(400).json({"error": "invalid user input"})
        }

        let comment = await client.hgetall(`comment:${req.params.commentid}`)
        if(!comment.hasOwnProperty('userid')) return res.status(400).json({"error": "commentid does not exist"})

        let userid = await client.hmget(`userid:${comment.userid}`, ["icon", "username", "icon_frame"])
        comment["commentid"] = req.params.commentid
        comment["icon"] = userid[0]
        comment["username"] = userid[1]
        comment["icon_frame"] = userid[2]

        return res.status(200).json(comment)
    }
    catch(e) {
        console.log("error in /comment/: route ==", e)
        return res.sendStatus(500)      
    }
})

router.get("/ncomment/:ncommentid", async (req, res) => {
    try {
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //req.params.ncommentid should be a valid ncommentid of length 25
        let schema = Joi.object().keys({
            ncommentid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required()
        })

        //validate schema
        let valid = schema.validate(req.params)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "ncommentid") return res.status(400).json({"error": "Invalid ncommentid"})
            return res.status(400).json({"error": "invalid user input"})
        }

        let ncomment = await client.hgetall(`ncomment:${req.params.ncommentid}`)
        if(!ncomment.hasOwnProperty('userid')) return res.status(400).json({"error": "ncommentid does not exist"})

        let userid = await client.hmget(`userid:${ncomment.userid}`, ["icon", "username", "icon_frame"])
        ncomment["ncommentid"] = req.params.ncommentid
        ncomment["icon"] = userid[0]
        ncomment["username"] = userid[1]
        ncomment["icon_frame"] = userid[2]

        return res.status(200).json(ncomment)
    }
    catch(e) {
        console.log("error in /ncomment/: route ==", e)
        return res.sendStatus(500)      
    }
})

/*
get popular sfw/nsfw

use timestamp and compare if n time has passed
use likes and timestamp and check which is relatively popular
*/

router.put("/comment", check_token(), async (req, res) => {
    try {
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})
        
        let schema = Joi.object().keys({
            commentid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required(),
            comment: Joi.string().min(1).max(1000).required()
        })

        let valid = schema.validate(req.body)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "commentid") return res.status(400).json({"error": "Invalid commentid"})
            if(label === "comment") return res.status(400).json({"error": "Invalid comment"})
            return res.status(400).json({"error": "invalid user input"})
        }
        
        let userid = await client.hget(`comment:${req.body.commentid}`, "userid")
        if(req.userid != userid) return res.status(400).json({"error": "you do not own this comment or commentid does not exist"})

        await client.hmset(`comment:${req.body.commentid}`, ["comment", req.body.comment, "isupdated", 1])
        return res.status(200).json({"status": "ok"})
    }
    catch(e) {
        console.log("error in /editcomment route ==", e)
        return res.sendStatus(500)   
    }
})

router.put("/ncomment", check_token(), async (req, res) => {
    try {
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        let schema = Joi.object().keys({
            ncommentid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required(),
            comment: Joi.string().min(1).max(1000).required()
        })

        let valid = schema.validate(req.body)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "ncommentid") return res.status(400).json({"error": "Invalid ncommentid"})
            if(label === "comment") return res.status(400).json({"error": "Invalid comment"})
            return res.status(400).json({"error": "invalid user input"})
        }

        let userid = await client.hget(`ncomment:${req.body.ncommentid}`, "userid")
        if(req.userid != userid) return res.status(400).json({"error": "you do not own this comment or commentid does not exist"})

        await client.hmset(`ncomment:${req.body.ncommentid}`, ["comment", req.body.comment, "isupdated", 1])
        return res.status(200).json({"status": "ok"})
    }
    catch(e) {
        console.log("error in /ncomment route ==", e)
        return res.sendStatus(500)   
    }
})

//remember to do a partial index for users who like posts
//also a index as well for users who want to share folders of some sort

router.delete("/comment/:postid/:commentid", check_token(), async (req, res) => {
    try {
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        let schema = Joi.object().keys({
            postid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required(),
            commentid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required()
        })

        let valid = schema.validate(req.params)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "postid") return res.status(400).json({"error": "Invalid postid"})
            if(label === "commentid") return res.status(400).json({"error": "Invalid commentid"})
            return res.status(400).json({"error": "invalid user input"})
        }
        
        let exists = await client.pipeline()
        .hmget(`comment:${req.params.commentid}`, "userid", "postid")
        .exists(`commentl:${req.params.postid}`)
        .exec()

        if(!exists[1][1]) return res.status(400).json({"error": "the postid does not exist"})
        if(!exists[0][1][0]) return res.status(400).json({"error": "the commentid does not exist"})
        if(exists[0][1][1] != req.params.postid) return res.status(400).json({"error": "the commentid has no relationship with the postid"})
        if(req.userid != exists[0][1][0]) return res.status(400).json({"error": "you do not own this comment"})

        //recommended to use unlink (when deleting large keys)
        //[cannot implement]: get the list of ncomments and delete it (not viable/worth it) 
        await client.pipeline()
        .del(`comment:${req.params.commentid}`)
        .zrem(`commentl:${req.params.postid}`, req.params.commentid)
        .zrem(`ss:comment_likes:${req.params.postid}`, req.params.commentid)
        .exec()

        return res.status(200).json({"status": "ok"})
    }
    catch(e) {
        console.log("error in /comment/:/: route ==", e)
        return res.sendStatus(500)   
    }
})

router.delete("/ncomment/:commentid/:ncommentid", check_token(), async (req, res) => {
    try {
        //set headers
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //validate object
        let schema = Joi.object().keys({
            commentid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required(),
            ncommentid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required()
        })
        let valid = schema.validate(req.params)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "commentid") return res.status(400).json({"error": "Invalid commentid"})
            if(label === "ncommentid") return res.status(400).json({"error": "Invalid ncommentid"})
            return res.status(400).json({"error": "invalid user input"})
        }

        let exists = await client.pipeline()
        .hmget(`ncomment:${req.params.ncommentid}`, ["userid", "ss:ncommentid"])
        .exists(`ss:ncomment:${req.params.commentid}`)
        .exec()

        if(!exists[1][1]) return res.status(400).json({"error": "the commentid does not exist"})
        if(!exists[0][1][0]) return res.status(400).json({"error": "the ncommentid does not exist"})
        if(exists[0][1][1] != req.params.commentid) return res.status(400).json({"error": "the ncommentid has no relationship with commentid"})
        if(req.userid != exists[0][1][0]) return res.status(400).json({"error": "you do not own this ncomment"})

        //recommended to use unlink (kvrocks does not support yet but upstash does)
        await client.pipeline()
        .del(`ncomment:${req.params.ncommentid}`)
        .zrem(`ss:ncomment:${req.params.commentid}`, req.params.ncommentid)
        .exec()

        return res.status(200).json({"status": "ok"})
    }
    catch(e) {
        console.log("error in /ncomment/:/: route ==", e)
        return res.sendStatus(500)   
    }
})

router.use(cors())

module.exports = router
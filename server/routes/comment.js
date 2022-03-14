const express = require("express")
const router = express.Router()
const cors = require("cors")
const {client, sclient, rclient} = require("../server_connection")
const check_token = require("../middleware/check_token")
const pagination = require("../middleware/pagination")
const Joi = require("joi")
const {nanoid} = require('nanoid')


/*
    * TODO:
    PRIVILEGE LEVELS - levels from 1 to 5
    LOCKED ACCOUNT - CANNOT BE VIEWED BY AVERAGE USER (unless privileged)
    DELETE AN ACCOUNT - CANNOT BE DONE BY AVERAGE USER (unless privileged)
*/

router.post("/comment", check_token(), async (req, res) => {
    try {
        //set headers
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //validate object
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

        //check posts exists and get permissions
        let cperm = await client.hmget(`post:${req.body.postid}`, ["userid", "can_comment", "can_comment_img", "can_comment_sticker"])
        if(!cperm[0]) return res.status(400).json({"error": "post does not exist"})

        //check post permissions if you are not the owner of the post
        if(cperm[0] != req.userid) {
            if(!cperm[1]) return res.status(400).json({"error": "post does not allow comments"})
            if(!cperm[2]) return res.status(400).json({"error": "post does not allow images in the comments"})
            if(!cperm[3]) return res.status(400).json({"error": "post does not allow images in the comments"})
        }

        //create commentid
        let commentid = nanoid(parseInt(process.env.NANOID_LEN))

        //create comment and comment lookup using ss:comment (timestamp) or ss:comment_likes (likes)
        await client.pipeline()
        .zadd(`ss:comment:${req.body.postid}`, Math.floor(Date.now() / 1000), commentid)
        .zadd(`ss:comment_likes:${req.body.postid}`, 0, commentid)
        .hset(`comment:${commentid}`, ["userid", req.userid, "comment", req.body.comment, "postid", req.body.postid, "ss:commentid", req.body.postid, "likes", 0, "isupdated", 0, "timestamp", Math.floor(Date.now() / 1000)])
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
        //set headers
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //validate object
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

        //get the post permissions the comment belonging to postid and the ss:comment length
        let cidlist = await client.pipeline()
        .hmget(`post:${req.body.postid}`, ["userid", "can_comment", "can_comment_img", "can_comment_sticker"])
        .hmget(`comment:${req.body.commentid}`, `postid`)
        .zcard(`ss:ncomment:${req.body.commentid}`)
        .exec()

        //check if the post exists
        if(!cidlist[0][1][0]) return res.status(400).json({"error": "post does not exist"})

        //if posts exists check if you are the owner to bypass your post settings
        if(cidlist[0][1][0] != req.userid) {
            if(!cidlist[0][1][1]) return res.status(400).json({"error": "post does not allow comments"})
            if(!cidlist[0][1][2]) return res.status(400).json({"error": "post does not allow images in the comments"})
            if(!cidlist[0][1][3]) return res.status(400).json({"error": "post does not allow images in the comments"})
        }

        //check if the comment belongs to the post and if the length of the commentsize >= 500
        if(cidlist[1][1][0] != req.body.postid) return res.status(400).json({"error": "commentid does not exist or postid has no relationship with commentid"})
        if(cidlist[2][1] >= 500) return res.status(400).json({"error": "comment has reached max reply limit"})

        //create ncommentid
        let ncommentid = nanoid(25)
        
        //create ncomment and ncomment lookup using ss:ncomment (timestamp)
        await client.pipeline()
        .zadd(`ss:ncomment:${req.body.commentid}`, Math.floor(Date.now() / 1000), ncommentid)
        .hset(`ncomment:${ncommentid}`, ["userid", req.userid, "ncomment", req.body.comment, "ss:ncommentid", req.body.commentid, "commentid", req.body.commentid, "likes", 0, "isupdated", 0])
        .exec()
        
        return res.status(200).json({"comment": req.body.comment, "ncommentid": ncommentid})
    } 
    catch (e) {
        console.log("error in /ncomment route ==", e)
        return res.sendStatus(500)
    }
})

//allow stickers as well like in telegram!

router.get("/comment", pagination(), async (req, res) => {
    try {
        //set headers
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //validate object
        let schema = Joi.object().keys({
            postid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required(),
            type: Joi.string().valid("like", "reg").required()
        })
        let valid = schema.validate(req.query)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "postid") return res.status(400).json({"error": "Invalid postid"})
            if(label === "type") return res.status(400).json({"error": "Invalid type"})
            return res.status(400).json({"error": "invalid user input"})
        }

        //check the size of the ss:comment and check if we reached the end of the list
        let ss_comment_size = await client.zcard(`ss:comment:${req.query.postid}`)
        if(req.start >= ss_comment_size) return res.status(400).json({"error": "you have no more posts to see"})

        //check if we are requesting the like sorted set or the regular sorted set and if the length is 0 or not
        let cidlist = ("like" === req.query.type) ? 
        await client.zrevrange(`ss:comment_likes:${req.query.postid}`, req.start, req.end) 
        : await client.zrange(`ss:comment:${req.query.postid}`, req.start, req.end)
        if(cidlist.length === 0) return res.status(400).json({"error": "postid does not exist"})

        //pipeline all comments and execute
        let pipe = client.pipeline()
        for (let i = 0; i < cidlist.length; i++) { 
            pipe.hgetall(`comment:${cidlist[i]}`)
        }
        let cdata = await pipe.exec()

        //format the data
        let ss_commentist = []
        for (let i = 0; i < cidlist.length; i++) {
            let userinfo = await client.hmget(`userid:${cdata[0][1].userid}`, "icon", "username", "icon_frame")
            cdata[i][1]["commentid"] = cidlist[i]
            cdata[i][1]["icon"] = userinfo[0]
            cdata[i][1]["username"] = userinfo[1]
            cdata[i][1]["icon_frame"] = userinfo[2]
            ss_commentist.push(cdata[i][1])
        }
        
        return res.status(200).json(ss_commentist)
    }
    catch (e) {
        console.log("error in /comment route ==", e)
        return res.sendStatus(500)   
    }
})

router.get("/ncomment", pagination(), async (req, res) => {
    try {
        //set headers
        res.set({'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //validate object
        let schema = Joi.object().keys({
            commentid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required()
        })
        let valid = schema.validate(req.query)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "commentid") return res.status(400).json({"error": "Invalid commentid"})
            return res.status(400).json({"error": "invalid user input"})
        }

        //check the size of the ss:comment
        let ss_ncomment_size = await client.zcard(`ss:ncomment:${req.query.commentid}`)

        //check if start >= ss:ncomment size  (start is the index of the first element to be returned)
        if(req.start >= ss_ncomment_size) return res.status(400).json({"error": "no more comments to see"})
        
        //get an array of the ncomment ids and return error if length is 0
        let ncomm_arr = await client.zrange(`ss:ncomment:${req.query.commentid}`, req.start, req.end)
        if(ncomm_arr.length === 0) return res.status(400).json({"error": "commentid does not exist"})

        //pipeline all ncomments and execute
        let pipe = client.pipeline()
        for (let i = 0; i < ncomm_arr.length; i++) { 
            pipe.hgetall(`ncomment:${ncomm_arr[i]}`)
        }
        let cdata = await pipe.exec()

        //could make concurrent
        //https://dev.to/apurbostarry/how-to-make-concurrent-api-calls-in-nodejs-35b8
        let ss_commentist = []
        for (let i = 0; i < ncomm_arr.length; i++) {
            let userinfo = await client.hmget(`userid:${cdata[i][1].userid}`, "icon", "username", "icon_frame")
            cdata[i][1]["ncommentid"] = ncomm_arr[i]
            cdata[i][1]["icon"] = userinfo[0]
            cdata[i][1]["username"] = userinfo[1]
            cdata[i][1]["icon_frame"] = userinfo[2]
            ss_commentist.push(cdata[i][1])
        }
        
        return res.status(200).json(ss_commentist)
    }
    catch (e) {
        console.log("error in /ncomment route ==", e)
        return res.sendStatus(500)   
    }
})

router.get("/comment/:commentid", async (req, res) => {
    try {
        //set headers
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //validate object
        let schema = Joi.object().keys({
            commentid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required()
        })
        let valid = schema.validate(req.params)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "commentid") return res.status(400).json({"error": "Invalid commentid"})
            return res.status(400).json({"error": "invalid user input"})
        }

        //get and check if commentid exists
        let comment = await client.hgetall(`comment:${req.params.commentid}`)
        if(!comment.hasOwnProperty('userid')) return res.status(400).json({"error": "commentid does not exist"})

        //get user info
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
        //set headers
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //validate object
        let schema = Joi.object().keys({
            ncommentid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required()
        })
        let valid = schema.validate(req.params)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "ncommentid") return res.status(400).json({"error": "Invalid ncommentid"})
            return res.status(400).json({"error": "invalid user input"})
        }

        //get and check if ncommentid exists
        let ncomment = await client.hgetall(`ncomment:${req.params.ncommentid}`)
        if(!ncomment.hasOwnProperty('userid')) return res.status(400).json({"error": "ncommentid does not exist"})

        //get user info
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
        //set headers
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})
        
        //validate object
        let schema = Joi.object().keys({
            commentid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required(),
            comment: Joi.string().min(1).max(1000).required()
        })
        let valid = schema.validate(req.body)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "commentid") return res.status(400).json({"error": "invalid commentid"})
            if(label === "comment") return res.status(400).json({"error": "invalid comment"})
            return res.status(400).json({"error": "invalid user input"})
        }
        
        //check if comment exists and get userid from the comment
        let userid = await client.hget(`comment:${req.body.commentid}`, "userid")
        if(!userid) return res.status(400).json({"error": "commentid does not exist"})

        //check if the userid is the same one who is modifying the comment
        if(req.userid != userid) return res.status(400).json({"error": "you do not own this comment"})

        //update comment
        await client.hmset(`comment:${req.body.commentid}`, ["comment", req.body.comment, "isupdated", 1])

        return res.sendStatus(200)
    }
    catch(e) {
        console.log("error in /editcomment route ==", e)
        return res.sendStatus(500)   
    }
})

router.put("/ncomment", check_token(), async (req, res) => {
    try {
        //set headers
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //validate object
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

        //check if ncomment exists and get userid from the ncomment
        let userid = await client.hget(`ncomment:${req.body.ncommentid}`, "userid")
        if(!userid) return res.status(400).json({"error": "ncommentid does not exist"})
        if(req.userid != userid) return res.status(400).json({"error": "you do not own this comment or commentid does not exist"})

        //update ncomment
        await client.hmset(`ncomment:${req.body.ncommentid}`, ["comment", req.body.comment, "isupdated", 1])

        return res.sendStatus(200)
    }
    catch(e) {
        console.log("error in /ncomment route ==", e)
        return res.sendStatus(500)   
    }
})

//remember to do a partial index for users who like posts
//also a index as well for users who want to share folders of some sort

router.delete("/comment/:commentid", check_token(), async (req, res) => {
    try {
        //set headers
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //validate object
        let schema = Joi.object().keys({
            commentid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required()
        })
        let valid = schema.validate(req.params)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "commentid") return res.status(400).json({"error": "Invalid commentid"})
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
    }
    catch(e) {
        console.log("error in delete /comment/: route ==", e)
        return res.sendStatus(500)   
    }
})

router.delete("/ncomment/:ncommentid", check_token(), async (req, res) => {
    try {
        //set headers
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //validate object
        let schema = Joi.object().keys({
            ncommentid: Joi.string().regex(/^[a-zA-Z0-9-_]{25}$/).required()
        })
        let valid = schema.validate(req.params)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "ncommentid") return res.status(400).json({"error": "Invalid ncommentid"})
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
    }
    catch(e) {
        console.log("error in /ncomment/:/: route ==", e)
        return res.sendStatus(500)   
    }
})

router.use(cors())

module.exports = router
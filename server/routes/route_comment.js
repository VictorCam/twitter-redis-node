const express = require("express")
const router = express.Router()
const cors = require("cors")
const {client, sclient, rclient} = require("../server_connection")
const check_token = require("../middleware/check_token")
const Joi = require("joi")
const {nanoid} = require('nanoid')

router.post("/comment", check_token(), async (req, res) => {
    try {

        //schema
        const schema = Joi.object({
            // post: Joi.string().min(1).max(100).required()
        })

        //validate json & make new post uid
        // var valid = schema.validate(req.body)
        // if(valid.error) return res.status(422).json({"error": "invalid or missing key value"})

        if(!await client.hexists(`post:${req.body.postid}`, "userid")) return res.json({"error": "post does not exist"})
        
        var commentid = nanoid(25)
        await client.pipeline()
        .zadd(`comments:${req.body.postid}`, Math.floor(new Date().getTime() / 1000), commentid)
        .zadd(`comments_liked:${req.body.postid}`, 0, commentid)
        .hset(`comment:${commentid}`, ["userid", req.userid, "comment", req.body.comment, "postid", req.body.postid, "likes", 0])
        .exec()

        //add ncomments when looking up if there are any nested commentes

        return res.status(200).json({"comment": req.body.comment, "commentid": commentid})
    } 
    catch (e) {
        console.log("error in /comment route ==", e)
        return res.sendStatus(500)   
    }
})


router.post("/ncomment", check_token(), async (req, res) => {
    try {

        //schema
        const schema = Joi.object({
            // post: Joi.string().min(1).max(100).required()
        })

        //optimize later when doing pipelining

        //validate json & make new post uid
        // var valid = schema.validate(req.body)
        // if(valid.error) return res.status(422).json({"error": "invalid or missing key value"})

        var results = await client.pipeline()
        .hexists(`post:${req.body.postid}`, "userid")
        .hget(`comment:${req.body.commentid}`, `postid`)
        .exec()
        if(!results[0][1]) return res.json({"error": "post does not exist"})
        if(results[1][1] != req.body.postid) return res.json({"error": "comment does not exist" })

        var ncommentid = nanoid(25)
        
        await client.pipeline()
        .zadd(`ncomments:${req.body.commentid}`, Math.floor(new Date().getTime() / 1000), ncommentid)
        .hset(`ncomment:${ncommentid}`, ["userid", req.userid, "ncomment", req.body.comment, "likes", 0])
        .exec()
        
        return res.status(200).json({"comment": req.body.comment, "ncommentid": ncommentid, "ncomments": req.body.commentid})
    } 
    catch (e) {
        console.log("error in /ncomment route ==", e)
        return res.sendStatus(500)
    }
})


router.get("/getcomments", check_token(), async (req, res) => {
    try {

        //dont forget schema
        //liked version needs to be reversed on the likes
        //allow owner to delete both nested and original comments
        //allow stickers as well like in telegram!

        var type = ("liked" == req.query.type) ? "comments_liked:" : "comments:"
        var start = parseInt(req.query.amount)*parseInt(req.query.page)+parseInt(req.query.page)
        var end = parseInt(req.query.amount)*((parseInt(req.query.page)+1))+parseInt(req.query.page)
        var results = await client.zrange(type+req.query.postid, start, end)

        var pipe = client.pipeline()
        for (let i = 0; i < results.length; i++) { 
            pipe.hmget(`comment:${results[i]}`, "userid", "comment", "likes", "postid")
            pipe.exists(`ncomments:${results[i]}`)
        }
        var result = await pipe.exec()

        var array = []
        for (let i = 0; i < results.length; i++) {
            if(result[i*2][1][0]) {
            var userinfo = await client.hmget(`userid:${result[i*2][1][0]}`, "icon", "username")
                array.push({
                    "postid": result[i*2][1][3],
                    "commentid": results[i],
                    "userid": result[i*2][1][0],
                    "icon": userinfo[0],
                    "username": userinfo[1],
                    "comment":  result[i*2][1][1],
                    "likes": parseInt(result[i*2][1][2]),
                    "has_ncomments": result[(i*2)+1][1],
                })
            }
        }
        
        return res.status(200).json(array)
    }
    catch (e) {
        console.log("error in /getcomments route ==", e)
        return res.sendStatus(500)   
    }
})

router.get("/getncomments", check_token(), async (req, res) => {
    try {
        var start = parseInt(req.query.amount)*parseInt(req.query.page)+parseInt(req.query.page)
        var end = parseInt(req.query.amount)*((parseInt(req.query.page)+1))+parseInt(req.query.page)
        var results = await client.zrange(`ncomments:${req.query.commentid}`, start, end)

        console.log("test", results)
        var pipe = client.pipeline()
        for (let i = 0; i < results.length; i++) { 
            pipe.hgetall(`ncomment:${results[i]}`)
        }
        var result = await pipe.exec()

        var array = []
        for (let i = 0; i < results.length; i++) {
            if(result[i][1].userid) {
            var userinfo = await client.hmget(`userid:${result[i][1].userid}`, "icon", "username")
                array.push({
                    "userid": result[i][1].userid,
                    "icon": userinfo[0],
                    "username": userinfo[1],
                    "comment":  result[i][1].ncomment,
                    "likes": parseInt(result[i][1].likes),
                })
            }
        }
        
        return res.status(200).json(array)
    }
    catch (e) {
        console.log("error in /getncomments route ==", e)
        return res.sendStatus(500)   
    }
})


router.use(cors());

module.exports = router;

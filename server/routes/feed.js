const express = require("express")
const cors = require("cors")
const {client, rclient} = require("../server_connection")
const {nanoid} = require('nanoid')
const check_token = require("../middleware/check_token")
const pagination = require("../middleware/pagination")
const router = express.Router()
const Joi = require("joi")
require("dotenv").config()

//we need to rethink this
//a route that sets a cookie with 15 userid's (we first need to pick a selection)
//dont forget we need to check if we are blocking a user when people rehowl something

router.post("/selection", check_token(), pagination(), async (req, res) => {
    try {
        //get the size of the following list
        var following_size = await client.zcard(`following:${req.userid}`)

        if(!following_size) return res.status(400).send("You are not following anyone")
        if(req.start >= following_size) return res.status(400).json({"error": "you have no more followers to see"})

        var followid = await client.zrevrange(`following:${req.userid}`, req.start, req.end, "withscores")

        if(!followid) return res.status(400).json({"error": "you don't have any followers"})

        result = []
        for(var i = 0; i < followid.length; i+=2) {
            var pres = await client.pipeline()
            .hmget(`userid:${followid[i]}`, "username", "icon")
            .zcount(`postl:${followid[i]}`, followid[i+1], "+inf")
            .exec()

            result.push({
                "username": pres[0][1][0],
                "icon": pres[0][1][1],
                "unread": pres[1][1],
                "userid": followid[i]
            })
        }

        res.status(200).json(result)
    }
    catch(e) {
        console.log("error in selection", e)
        return res.status(500).json({"error": "something went wrong"})
    }
})

router.get("/feed", check_token(), async (req, res) => {
    try {
        //use most of the code for feed just loop through the amount of users we have
        //and the grab around 50 posts from all users in total
        return res.status(200).json("test")
    }
    catch(e) {
        console.log("error in get timeline", e)
        return res.status(500).send("error occured")
    }
})

router.get("/feed/:userid", check_token(), pagination(), async (req, res) => {
    try {
        //for people who want to get the feed from a specific user
        var userid = req.params.userid

        //pagination not required but could be helpful??

        //get the score of the person you would like to see
        var index = await client.zscore(`following:${req.userid}`, userid)
        if(!index) return res.status(400).json({"error": "you are not following that user"})

        //zrange start from index to inf and limit by 15
        var postl = await client.zrangebyscore(`postl:${userid}`, index, "+inf", "withscores", "limit", 0, 15)

        if(postl.length == 0) return res.status(400).json({"error": "you have no posts to see"})

        //get the rank of the first postl array
        var pres = await client.pipeline()
        .zadd(`following:${req.userid}`, parseInt(postl[postl.length-1])+1, userid)
        .hmget(`userid:${userid}`, "username", "icon")
        .exec()

        var pipe = client.pipeline()
        for(var i = 0; i < postl.length; i+=2) {
            pipe.hgetall(`post:${postl[i]}`)
        }

        var results = await pipe.exec()
        var posts = []
        for(var i = 0; i < results.length; i++) {
            var result = results[i][1]
            result.username = pres[3][1][0]
            result.icon = pres[3][1][1]
            posts.push(result)
        }

        return res.status(200).json(posts)
    }
    catch(e) {
        console.log("error in get feed", e)
        return res.status(500).send("error occured")
    }
})

//grab 25 users and set it as a cookie
 
//use cookie to get postl of the userid of all 25 users (pipelined loop)

//[PERHAPS USE A INCREMENTING HASH TO REDUCE TIME COMPLEXITY]

//then we get the posts from the postl pipelined results (loop)

//we remove the users who do not have any posts

//[MISSING CASE WHERE 25 USERS HAVE NO POSTS!]
//[MISSING CASE WHERE 1 USER HAS 1 POST HAS A POST!]


router.use(cors())
module.exports = router
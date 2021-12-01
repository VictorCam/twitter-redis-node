const express = require("express")
const cors = require("cors")
const {client, rclient} = require("../server_connection")
const check_token = require("../middleware/check_token")
const pagination = require("../middleware/pagination")
const router = express.Router()
const Joi = require("joi")
require("dotenv").config()

router.get("/feed", check_token(), pagination(), async (req, res) => {
    try {
        //just make sure that joi doesnt go past 99999999 for page

        var followid = await client.zrevrange(`following:${req.userid}`, req.start, req.end, "withscores")
        if(!followid) return res.status(400).json({"error": "you don't have any followers"})
        var post_quantity = Math.floor(60 / (followid.length / 2))

        var posts = []
        for(var j = 0; j < followid.length; j+=2) {
            var postl = await client.zrangebyscore(`postl:${followid[j]}`, followid[j+1], "+inf", "withscores", "limit", 0, post_quantity)

            if(postl.length != 0) {
                var pres = await client.pipeline()
                .zadd(`following:${req.userid}`, parseInt(postl[postl.length-1])+1, followid[j])
                .hmget(`userid:${followid[j]}`, "username", "icon")
                .exec()

                var pres2 = client.pipeline()
                for(var i = 0; i < postl.length; i+=2) {
                    pres2.hgetall(`post:${postl[i]}`)
                }
                var results = await pres2.exec()

                for(var i = 0; i < results.length; i++) {
                    var result = results[i][1]
                    result.username = pres[1][1][0]
                    result.icon = pres[1][1][1]
                    posts.push(result)
                }
            }
        }
        return res.status(200).json(posts)
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

router.use(cors())
module.exports = router
const express = require("express")
const cors = require("cors")
const {client, rclient} = require("../server_connection")
const check_token = require("../middleware/check_token")
const pagination = require("../middleware/pagination")
const router = express.Router()
const Joi = require("joi")
require("dotenv").config()

//no validation required
router.get("/feed", check_token(), pagination(), async (req, res) => {
    try {
        let followid = await client.zrevrange(`following:${req.userid}`, req.start, req.end, "withscores")
        if(!followid) return res.status(400).json({"error": "you don't have any followers"})

        let postl_arr = []
        for(let j = 0; j < followid.length; j+=2) {
            postl_arr.push(client.zrangebyscore(`postl:${followid[j]}`, followid[j+1], "+inf", "withscores", "limit", 0, 25))
        }
        let postl = await Promise.allSettled(postl_arr)

        let update = []
        let userdata_arr = []
        let pres = client.pipeline()
        for(let i = 0; i < postl.length; i++) {
            if(postl[i].status == "fulfilled") {
                update.push({"last_score": parseInt(postl[i].value[postl[i].value.length-1])+1, "userid": followid[i*2]})

                userdata_arr.push(client.hmget(`userid:${followid[i*2]}`, "username", "icon", "icon_frame", "userid"))
                for(let j = 0; j < postl[i].value.length; j+=2) {
                    pres.hgetall(`post:${postl[i].value[j]}`)
                }
            }
        }
        let userdata = await Promise.allSettled(userdata_arr)
        let postdata = await pres.exec()

        //make a key value using the userid
        let user_post_map = {}
        for(let i = 0; i < userdata.length; i++) {
            if(userdata[i].status == "fulfilled") {
                user_post_map[userdata[i].value[3]] = userdata[i].value
            }
        }

        let posts = []
        for(let i = 0; i < postdata.length; i++) {
                let post = postdata[i][1]
                post["username"] = user_post_map[post["userid"]][0]
                post["icon"] = user_post_map[post["userid"]][1]
                post["icon_frame"] = user_post_map[post["userid"]][2]
                posts.push(post)
        }

        //update the last_score
        let pipe = client.pipeline()
        for(let i = 0; i < update.length; i++) {
            if(!isNaN(update[i].last_score)) {
                pipe.zadd(`following:${req.userid}`, update[i]["last_score"], update[i]["userid"])
            }
        }
        await pipe.exec()

        return res.status(200).json(posts)
    }
    catch(e) {
        console.log("error in get timeline", e)
        return res.status(500).send("error occured")
    }
})

router.get("/feed/:username", check_token(), async (req, res) => {
    try {
        //validate json schema
        const schema = Joi.object().keys({
            username: Joi.string().regex(/^[a-zA-Z0-9_-]{1,30}$/).required(),
        })

        let valid = schema.validate(req.params)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label == "username") return res.status(400).json({"error": "username must be between 1 and 30 characters and only contain letters, numbers, and underscores"})
            return res.status(500).json({"error": "something went wrong"})
        }

        //get the key of the username
        let userid = await client.get(`username:${req.params.username}`)
        if(!userid) return res.status(400).json({"error": "user does not exist"})
        if(userid == req.userid) return res.status(400).json({"error": "you cannot get the feed of yourself"})

        //get the score of the person you would like to see
        let index = await client.zscore(`following:${req.userid}`, userid)
        if(!index) return res.status(400).json({"error": "you are not following that user"})

        //zrange start from index to inf and limit by 15
        let postl = await client.zrangebyscore(`postl:${userid}`, index, "+inf", "withscores", "limit", 0, 15)
        if(postl.length == 0) return res.status(400).json({"error": "you have no posts to see"})

        await client.zadd(`following:${req.userid}`, parseInt(postl[postl.length-1])+1, userid)
        let userdata = await client.hmget(`userid:${userid}`, "username", "icon", "icon_frame")

        let pipe = client.pipeline()
        for(let i = 0; i < postl.length; i+=2) {
            pipe.hgetall(`post:${postl[i]}`)
        }
        let results = await pipe.exec()

        let posts = []
        for(let i = 0; i < results.length; i++) {
            let result = results[i][1]
            result.username = userdata[0]
            result.icon = userdata[1]
            result.icon_frame = userdata[2]
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
const express = require("express")
const cors = require("cors")
const {client, rclient} = require("../server_connection")
const check_token = require("../middleware/check_token")
const pagination = require("../middleware/pagination")
const router = express.Router()
const Joi = require("joi")
require("dotenv").config()

//username feed
router.get("/feed/:username", check_token(), async (req, res) => {
    try {
        //validate json schema
        const schema = Joi.object().keys({
            username: Joi.string().regex(/^[a-zA-Z0-9_-]{1,30}$/).required(),
        })
        
        //we can leave the user where they last left off
        //what if they want to go back?

        //if the cache exists then we are going to use that
        //the page will be 0 to +inf and the amount will be [5, 10, 15, 20, 25, 30, 50, 100]
        //cache:feed:sally/pg+amount

        let valid = schema.validate(req.params)
        if(valid.error) {
            let label = valid.error.details[0].context.label
            if(label === "username") return res.status(400).json({"error": "username must be between 1 and 30 characters and only contain letters, numbers, and underscores"})
            return res.status(500).json({"error": "something went wrong"})
        }

        //get the key of the username
        let userid = await client.get(`username:${req.params.username}`)
        if(!userid) return res.status(400).json({"error": "user does not exist"})
        if(userid === req.userid) return res.status(400).json({"error": "you cannot get the feed of yourself"})

        //get the score of the person you would like to see
        let index = await client.zscore(`following:${req.userid}`, userid)
        if(!index) return res.status(400).json({"error": "you are not following that user"})

        //zrange start from index to inf and limit by 15
        let postl = await client.zrangebyscore(`postl:${userid}`, index, "+inf", "withscores", "limit", 0, 15)
        if(postl.length === 0) return res.status(400).json({"error": "you have no posts to see"})

        //update the score of the following
        await client.zadd(`following:${req.userid}`, parseInt(postl[postl.length-1])+1, userid)
        let userdata = await client.hmget(`userid:${userid}`, "username", "icon", "icon_frame")

        //get the posts
        let pipe = client.pipeline()
        for(let i = 0; i < postl.length; i+=2) {
            pipe.hgetall(`post:${postl[i]}`)
        }
        let results = await pipe.exec()

        //format the posts and return
        let posts = []
        for(let i = 0; i < results.length; i++) {
            // console.log(results[i][1])
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
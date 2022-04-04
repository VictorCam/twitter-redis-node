const express = require("express")
const cors = require("cors")
const router = express.Router()
const Joi = require("joi")
require("dotenv").config()

const {client, rclient} = require("../server_connection")
const check_token = require("../middleware/check_token")
const pagination = require("../middleware/pagination")
const tc = require("../middleware/try_catch")
const {username} = require("../middleware/validation")

//username feed
//add a paramater to go "POS" or "NEG" (amount of posts)
router.get("/feed/:username", check_token(), tc(async (req, res) => {
    //set headers
    // res.set({"Access-Control-Allow-Origin": "*"})

    //validate object
    const schema = Joi.object().keys({
        username: username.required(),
    })
    let valid = schema.validate(req.params)
    if(valid.error) {
        if(valid.error.details[0].type !== 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //get the key of the username
    let userid = await client.get(`username:${req.params.username}`)
    if(!userid) return res.status(400).json({"error": "user does not exist"})
    if(userid === req.userid) return res.status(400).json({"error": "you cannot get the feed of yourself"})

    //get the score of the person you would like to see
    let index = await client.zscore(`following:${req.userid}`, userid)
    if(!index) return res.status(400).json({"error": "you are not following that user"})

    //zrange start from index to inf and limit by 15
    let ss_post = await client.zrangebyscore(`ss:post:${userid}`, index, "+inf", "withscores", "limit", 0, 15)
    if(ss_post.length === 0) return res.status(400).json({"error": "you have no posts to see"})

    //update the score of the following
    await client.zadd(`following:${req.userid}`, parseInt(ss_post[ss_post.length-1])+1, userid)

    //get the posts
    let pipe = client.pipeline()
    for(let i = 0; i < ss_post.length; i+=2) {
        pipe.hgetall(`post:${ss_post[i]}`)
    }
    let results = await pipe.exec()

    //format the posts and return
    let posts = []
    for(let i = 0; i < results.length; i++) {
        let result = results[i][1]
        posts.push(result)
    }

    return res.status(200).json(posts)
}))

router.use(cors())
module.exports = router
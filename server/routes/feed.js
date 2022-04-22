const express = require("express")
const cors = require("cors")
const router = express.Router()
const Joi = require("joi")
require("dotenv").config()

const {client, rclient} = require("../server_connection")
const check_token = require("../middleware/check_token")
const pagination = require("../middleware/pagination")
const tc = require("../middleware/try_catch")
const {v_username, v_userid, v_range} = require("../middleware/validation")


router.get("/feed", check_token(), tc(async (req, res) => {
    //set headers
    res.set({"Access-Control-Allow-Origin": "*"})

    //validate object
    const schema = Joi.object().keys({
        "username": v_username,
        "userid": v_userid,
        "range": v_range.required()
    }).xor("username", "userid").label("username or userid is required")
    let valid = schema.validate(req.query)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }
    
    //get the key of the username
    let userid = null
    if(valid.value.userid) userid = valid.value.userid
    if(valid.value.username) userid = await client.get(`username:${valid.value.username}`)
    if(userid == null) return res.status(400).json({"error": "user does not exist"})

    //check if you searched yourself
    if(userid == req.userid) return res.status(400).json({"error": "you cannot get the feed of yourself"})

    //get the score of the person you would like to see
    let index = await client.zscore(`following:${req.userid}`, userid)
    if(index == null) return res.status(400).json({"error": "you are not following that user"})

    //zrange start from index to inf and limit by N amount
    let ss_post = null
    let pos = 0
    if(valid.value.range < 0) {
        ss_post = await client.zrevrangebyscore(`ss:post:${userid}`, index, "-inf", "withscores", "limit", 0, valid.value.range*-1)
        pos = -1
    }
    else {
        ss_post = await client.zrangebyscore(`ss:post:${userid}`, index, "+inf", "withscores", "limit", 0, valid.value.range)
        pos = 1
    }

    //if there is no post return an empty array
    if(ss_post.length == 0) return res.status(200).json([])

    //check if the score is a floating string or floating integer
    let new_score = null 
    if(ss_post[ss_post.length-1].includes(".")) new_score = parseFloat(ss_post[ss_post.length-1]) + pos
    if(new_score == null) new_score = parseInt(ss_post[ss_post.length-1]) + pos

    //update the score of the following
    client.zadd(`following:${req.userid}`, new_score, userid)

    //get the posts
    let pipe = client.pipeline()
    for(let i = 0; i < ss_post.length; i+=2) {
        pipe.hgetall(`post:${ss_post[i]}`)
    }
    let results = await pipe.exec()

    //format and remove posts that do not exist in case someone deletes while someone is trying to acess the feed
    let posts = []
    for(let i = 0; i < results.length; i++) {
        if(results[i][1] != null) {
            let result = results[i][1]
            posts.push(result)
        }
    }

    return res.status(200).json(posts)
}))

router.use(cors())
module.exports = router
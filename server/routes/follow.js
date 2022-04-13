const express = require("express")
const cors = require("cors")
const router = express.Router()
const Joi = require("joi")
require("dotenv").config()
const {nanoid} = require('nanoid')
const base62 = require("base62/lib/ascii")

const {client, rclient} = require("../server_connection")
const check_token = require("../middleware/check_token")
const pagination = require("../middleware/pagination")
const tc = require("../middleware/try_catch")
const {v_username, v_userid} = require("../middleware/validation")

//follow a user
router.post("/follow", check_token(), tc(async (req, res) => {
    //set headers
    res.set({"Access-Control-Allow-Origin": "*"})

    //validate object
    const schema = Joi.object().keys({
        "username": v_username,
        "userid": v_userid
    }).xor("username", "userid").label("username or userid is required")
    let valid = schema.validate(req.body)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //get username and check if the user exists and if the user is not the same as the one who is trying to follow
    let followid = null
    if(valid.value.userid) followid = valid.value.userid
    if(valid.value.username) followid = await client.get(`username:${valid.value.username}`)
    if(followid == null) return res.status(400).json({"error": "user does not exist"})

    //check if you searched yourself
    if(followid == req.userid) return res.status(400).json({"error": "you cannot follow yourself"})

    //add the the new user to your following list and vice versa
    let unix_ms = Date.now()

    //add the following user to the followers list
    let pipe = client.pipeline()
    pipe.zadd(`following:${req.userid}`, unix_ms, followid)
    pipe.zadd(`followers:${followid}`, unix_ms, req.userid)
    let [[,following], [,followers]] = await pipe.exec()

    //check if the following is 0 (which means the member exists)
    if(following == 0) return res.status(400).json({"error": "you are already following this user"})

    return res.sendStatus(200)
}))


router.post("/unfollow", check_token(), tc(async (req, res) => {
    //set headers
    res.set({"Access-Control-Allow-Origin": "*"})

    //validate object
    const schema = Joi.object().keys({
        "username": v_username,
        "userid": v_userid
    }).xor("username", "userid").label("username or userid is required")
    let valid = schema.validate(req.body)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //get username and check if the user exists and if the user is not the same as the one who is trying to unfollow
    let followid = null
    if(valid.value.userid) followid = valid.value.userid
    if(valid.value.username) followid = await client.get(`username:${valid.value.username}`)
    if(followid == null) return res.status(400).json({"error": "user does not exist"})

    //check if you searched yourself
    if(followid == req.userid) return res.status(400).json({"error": "you cannot unfollow yourself"})

    //unfollow the user
    let pipe = client.pipeline()
    pipe.zrem(`following:${req.userid}`, followid)
    pipe.zrem(`followers:${followid}`, req.userid)
    let [[,following], [,followers]] = await pipe.exec()

    //check if the member was deleted or not else we were not follow the user in the first place
    if(following == 0) return res.status(400).json({"error": "you are not following this user"})

    return res.sendStatus(200)
}))

router.get("/following", check_token(), pagination(), tc(async (req, res) => {
    //set headers
    res.set("Access-Control-Allow-Origin", "*")

    //DONT FORGET THIS LOGIC FOR LOCKED ACCOUNTS!
    //check if you are allowed to see the following list
    //if you are not allowed to see the following list, return that this account is locked
    //get the username

    //validate object
    const schema = Joi.object().keys({
        "username": v_username,
        "userid": v_userid
    }).xor("username", "userid").label("username or userid is required")
    let valid = schema.validate(req.query)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check if the username exists
    let userid = null
    if(valid.value.username) userid = await client.get(`username:${valid.value.username}`)
    if(valid.value.userid) userid = valid.value.userid
    if(userid == null) return res.status(400).json({"error": "user does not exist"})

    //check the permission of the userid
    //TODO

    //get the following list and check it is not null and is not an empty array
    let following = await client.zrange(`following:${userid}`, req.start, req.end)
    if(following.length === 0) return res.status(200).json([])

    //format data
    let data = []
    for(let i = 0; i < following.length; i++) {
        data.push({"userid": following[i]})
    }

    //return the username, icon, and desc of the users you are following
    return res.status(200).json(data)
}))

//dont forget we need to check if we are blocking a user when people rehowl something
//dont forget to check if we are blocking a user when people rehowl something
//also for blocking we need to remove the person

router.get("/following/remain", check_token(), pagination(), tc(async (req, res) => {

    let pipe = client.pipeline()
    pipe.zcard(`following:${req.userid}`)
    pipe.zrange(`following:${req.userid}`, req.start, req.end, "withscores")
    let [[,following_size], [,following]] = await pipe.exec()

    //check if following_size is null AND check if the req.start >= following_size AND check if zrange is null
    if(following_size == 0) return res.status(400).json({"error": "you are not following anyone"})
    if(req.start >= following_size) return res.status(400).json({"error": "you are not following anyone"})
    if(following.length == 0) return res.status(400).json({"error": "you don't have any followers"})

    //get the posts left using zcount
    let pipe_d = client.pipeline()
    for(let i = 0; i < following.length; i+=2) {
        pipe_d.zcount(`ss:post:${following[i]}`, following[i+1], "+inf")
    }
    let unread_posts = await pipe_d.exec()

    //format data
    let followdata = []
    for(let i = 0; i < following.length; i+=2) {
        followdata.push({"userid": following[i], "unread": unread_posts[i/2][1]})
    }

    return res.status(200).json(followdata)
}))


router.use(cors())
module.exports = router
const express = require("express")
const cors = require("cors")
const {client, rclient} = require("../server_connection")
const check_token = require("../middleware/check_token")
const pagination = require("../middleware/pagination")
const router = express.Router()
const Joi = require("joi")
require("dotenv").config()

//follow a user
router.post("/follow", check_token(), async (req, res) => {
    try {
        res.set({"Access-Control-Allow-Origin": "*"})

        //create a zset with the userid of the original user
        var followid = await client.get(`username:${req.body.username}`)

        //return when a followid does not exist
        //check if followid matches your id
        if(!followid) return res.status(400).json({"error": "user does not exist"})
        if(followid == req.userid) return res.status(400).json({"error": "you can't follow yourself"})

        //check if the user is already following the user
        var following = await client.zscore(`following:${req.userid}`, followid)
        if(following) return res.status(400).json({"error": "you are already following this user"})

        //add the the new user to your following list and vice versa
        await client.pipeline()
        .zadd(`following:${req.userid}`, Math.floor(Date.now() / 1000), followid)
        .zadd(`followers:${followid}`, Math.floor(Date.now() / 1000), req.userid)
        .exec()

        return res.status(200).json({"status": "ok"})

    }
    catch (e) {
        console.log(e)
        return res.status(500).send("error in /following")
    }
})

//test route
router.post("/unfollow", check_token(), async (req, res) => {
    try {
        res.set({"Access-Control-Allow-Origin": "*"})

        var followid = await client.get(`username:${req.body.username}`)

        if(!followid) return res.status(400).json({"error": "user does not exist"})
        if(followid == req.userid) return res.status(400).json({"error": "you can't unfollow yourself"})

        var following = await client.zscore(`following:${req.userid}`, followid)
        if(!following) return res.status(400).json({"error": "you are not following this user"})

        await client.pipeline()
        .zrem(`following:${req.userid}`, followid)
        .zrem(`followers:${followid}`, req.userid)
        .exec()

        return res.status(200).json({"status": "ok"})
    }
    catch(e) {
        console.log(e)
        return res.status(500).send("error in /unfollow")
    }
})

router.get("/following/:username", check_token(), async (req, res) => {
    try {
        res.set("Access-Control-Allow-Origin", "*")

        //DONT FORGET THIS LOGIC FOR LOCKED ACCOUNTS!
        //check if you are allowed to see the following list
        //if you are not allowed to see the following list, return that this account is locked
        //get the username
        var userid = await client.get(`username:${req.params.username}`)

        //check if the username exists
        if(!userid) return res.status(400).json({"error": "user does not exist"})

        //check the permission of the userid
        //TODO

        //something here I think but im too tired to figure it out now

        //show 15 of the users you are following at a time
        var amount = parseInt(req.query.amount)
        var page = parseInt(req.query.page)
        var start = amount*page+page
        var end = amount*(page+1)+page
    
        var following = await client.zrevrange(`following:${userid}`, start, end)

        //if you are following no one, return an empty array
        if(!following) return res.status(200).json({})

        //get the username, icon, and desc of the users you are following
        var pipe = client.pipeline()
        for(let i = 0; i < following.length; i++) {
            pipe.hmget(`userid:${following[i]}`, "username", "icon", "desc", "icon_frame")
        }
        var followlist = await pipe.exec()

        followdata = []
        for(let i = 0; i < followlist.length; i++) {
            followdata.push({
                "username": followlist[i][1][0],
                "icon": followlist[i][1][1],
                "desc": followlist[i][1][2],
                "icon_frame": followlist[i][1][3]
            })
        }
        //return the username, icon, and desc of the users you are following
        return res.status(200).json(followdata)
    }
    catch(e) {
        console.log(e)
        return res.status(500).send("error in get /follow")
    }
})

//dont forget we need to check if we are blocking a user when people rehowl something
//dont forget to check if we are blocking a user when people rehowl something
//also for blocking we need to remove the person
router.get("/following", check_token(), pagination(), async (req, res) => {
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
            .hmget(`userid:${followid[i]}`, "username", "icon", "icon_frame")
            .zcount(`postl:${followid[i]}`, followid[i+1], "+inf")
            .exec()

            result.push({
                "username": pres[0][1][0],
                "icon": pres[0][1][1],
                "icon_frame": pres[0][1][2],
                "unread": pres[1][1]
            })
        }

        res.status(200).json(result)
    }
    catch(e) {
        console.log("error in selection", e)
        return res.status(500).json({"error": "something went wrong"})
    }
})


router.use(cors())
module.exports = router
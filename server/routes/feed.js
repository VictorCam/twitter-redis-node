const express = require("express")
const cors = require("cors")
const {client, rclient} = require("../server_connection")
const {nanoid} = require('nanoid')
const check_token = require("../middleware/check_token")
const router = express.Router()
const Joi = require("joi")
require("dotenv").config()

//a route that sets a cookie with 15 userid's (we first need to pick a selection)
router.get("/selection", check_token(), async (req, res) => {

    //limit by 15
    var amount = parseInt(req.query.amount)
    var page = parseInt(req.query.page)
    var start = amount*page+page
    var end = amount*((page+1))+page

    var followid = await client.zrevrange(`following:${req.userid}`, start, end, "withscores")

    if(!followid) return res.status(400).json({"error": "you don't have any followers"})

    result = []
    jdata = {}
    // console.log(followid)
    for(var i = 0; i < followid.length; i+=2) {
        //get the userid from the followid
        // var userdata = await client.hmget(`userid:${followid[i]}`, "username", "icon")

        var userdata = await client.hmget(`userid:${followid[i]}`, "username", "icon", "postl_index")
        var postl_index = parseInt(userdata[2])
        var index = parseInt(followid[i+1])

        //OPTIMIZE HERE
        //get the size of the userid's postl
        var postl_size = await client.zcard(`postl:${followid[i]}`)

        var read = index

        if(postl_index > index) {
            // console.log("if1", userdata[0])
            read = postl_index-index
        }
        if(postl_index < index) {
            // console.log("if2", userdata[0])
            read = index-postl_index
        }
        // console.log("end", userdata[0])
        result.push({"username": userdata[0], "icon": userdata[1], "userid": followid[i], "read": read, "unread": postl_size-read})
    }

    res.status(200).json(result)
})

router.post("/selection", check_token(), async (req, res) => {

    //limit by 15
    var amount = parseInt(req.query.amount)
    var page = parseInt(req.query.page)
    var start = amount*page+page
    var end = amount*((page+1))+page

    var followid = await client.zrevrange(`following:${req.userid}`, start, end, "withscores")

    if(!followid) return res.status(400).json({"error": "you don't have any followers"})

    //set a secure signed cookie
    res.cookie("followers", followid, { signed: true, httpOnly: true })

    res.status(200).json({"status": "ok"})

})

router.get("/feed", check_token(), async (req, res) => {
    try {

        //make the feed elastic depend on the amount of users
        //that DO have a post

        //get the 25 array of users

        //check if the user has a cookie named followers
        var followers = req.cookies.followers

        if(!followers) return res.status(400).json({"error": "you don't have any followers"})

        //get 3 results from the smallest unix timestamp from sorted set of following
        let following = await client.zrange("following:" + req.userid, 0, 4, "WITHSCORES")
        // console.log("following", following)

        //check if they have posts else we updated the zrange score (we only limit up to 15 posts)
        let has_posts = await client.zrangebyscore(`postl:${following[0]}`, following[1], "+inf", "WITHSCORES", "LIMIT", 0, 15)

        if (has_posts.length == 0) {
            //we silently update the zrange score of that user and grab the next one
            //DO NOT DELETE THIS
            // await client.zadd("following:" + req.userid, Math.floor(Date.now()/1000), following[0])
            //return nothing
            return res.status(200).json({})
        }

        var posts = []
        //get the posts from the users
        for (let i = 0; i < has_posts.length; i++) {
            let post = await client.hgetall(`post:${has_posts[i]}`)
            posts.push(post)
        }

        // console.log("test", has_posts[has_posts.length-1])

        //DO NOT DELETE THIS
        // await client.zadd("following:" + req.userid, has_posts[has_posts.length-1], following[0])


        // //get the posts that are greater than the last unix id
        // let posts = await client.zrangebyscore(`postl:${following[0]}`, 0, following[1], "WITHSCORES")

        // console.log("posts", posts)


        return res.status(200).json(posts)

    }
    catch(e) {
        console.log("error in get timeline", e)
        return res.status(500).send("error occured")
    }
})

router.get("/feed/:userid", check_token(), async (req, res) => {
    try {
        //for people who want to get the feed from a specific user
        return res.status(200).json("test")

    }
    catch(e) {
        console.log("error in get timeline", e)
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
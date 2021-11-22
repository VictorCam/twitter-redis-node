const express = require("express")
const cors = require("cors")
const {client, rclient} = require("../server_connection")
const {nanoid} = require('nanoid')
const check_token = require("../middleware/check_token")
const router = express.Router()
const Joi = require("joi")
require("dotenv").config()

//a route that sets a cookie with 15 userid's (we first need to pick a selection)
router.post("/selection", check_token(), async (req, res) => {

    //limit by 15
    var amount = parseInt(req.query.amount)
    var page = parseInt(req.query.page)
    var start = amount*page+page
    var end = amount*((page+1))+page

    var followid = await client.zrevrange(`following:${req.userid}`, start, end, "withscores")

    if(!followid) return res.status(400).json({"error": "you don't have any followers"})

    cookiearr = []
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

        //DO COOOKIE STUFF HERE
        if(postl_size-read != 0) {
            cookiearr.push(followid[i], postl_size, read)
        }

        // cookiearr.push({"un": userdata[0], "i": userdata[1], "id": })

        // console.log("end", userdata[0])
        result.push({"username": userdata[0], "icon": userdata[1], "userid": followid[i], "read": read, "unread": postl_size-read})
    }

    res.cookie("followers", cookiearr, { signed: true, httpOnly: true })

    res.status(200).json(result)
})

router.get("/feed", check_token(), async (req, res) => {
    try {
        //we get 15 posts from each user and userid data using
        //for loop to get the userid's postl and userid data
        //then we execute with a pipeline then store the result and do it again
        //until no more data in cookie (users)
        //we get the userid and icon of that user
        //we remove a user when they have no more posts
        //when the cookie is empty we will call the selection route again to get new users
        var followers = req.signedCookies.followers

        // console.log(followers)

        var posts = []
        for(var i = 0; i < followers.length; i+=3) {
            var unread = followers[i+1]-followers[i+2]
            console.log("unread", unread)
            var postl = await client.zrange(`postl:${followers[i]}`, followers[i+2], followers[i+1], "WITHSCORES")
            console.log("postl", postl)

            var pipe = client.pipeline()
            var userdata = await client.hmget(`userid:${followers[i]}`, "username", "icon")
            for(var j = 0; j < postl.length; j+=2) {
                pipe.hgetall(`post:${postl[j]}`)
            }
            var results = await pipe.exec()
            console.log("RESULT", results)
            console.log("\n\n")
            delete results[0][0];
            posts.push({"username": userdata[0], "icon": userdata[1], "userid": followers[i], "unread": unread, "posts": results})
        }

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
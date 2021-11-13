const jwt = require("jsonwebtoken")
const express = require("express")
const cors = require("cors")
const bcrypt = require('bcrypt')
const {client, rclient} = require("../server_connection")
const {nanoid} = require('nanoid')
const check_token = require("../middleware/check_token")
const router = express.Router()
const Joi = require("joi")
require("dotenv").config()

//case where users don't have any followers
//case where users have a few followers
//case where users have a lot of followers
//case where users don't have 15 followers
//case where users have 20 followers

//follow a user
router.post("/following", check_token(), async (req, res) => {
    try {
        res.set({"Access-Control-Allow-Origin": "*"})

        //create a zset with the userid of the original user
        var followid = await client.get(`username:${req.body.username}`)

        //check if followid matches your id
        if(followid == req.userid) return res.status(400).json({"error": "you can't follow yourself"})

        //check if the user is already following the user???

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

router.use(cors())
module.exports = router
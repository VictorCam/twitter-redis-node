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
router.post("/follow", async (req, res) => {
    try {
        res.set({"Access-Control-Allow-Origin": "*"})

        // console.log("follow triggered")
        // console.log("t1", Date.now())
        // console.log("t2", new Date().getTime())
        // console.log("ft2/1000", Math.floor(Date.now() / 1000))
        // console.log("ft3/1000", Math.floor(new Date().getTime() / 1000))

        return res.status(200).json({"ok": "boomer"})

        //create a zset with the userid





    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})

//

router.use(cors())
module.exports = router
const jwt = require("jsonwebtoken")
const express = require("express")
const cors = require("cors")
const bcrypt = require('bcrypt')
const formidable = require('formidable')
const {client, rclient} = require("../server_connection")
const {nanoid} = require('nanoid')
const check_token = require("../middleware/check_token")
const router = express.Router()
const Joi = require("joi")
require("dotenv").config()

//FIND STICKERS BY INDEXING THE ONES THEY ALREADY HAVE

router.post("/login", async (req, res) => {
    try {
        //set headers
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //avoid colons in the username
        //allow letter numbers and common special chracters in password
        const schema = Joi.object().keys({
            username: Joi.string().regex(/^[a-zA-Z0-9_]*$/).min(1).max(30).required(),
            password: Joi.string().regex(/^[a-zA-Z0-9_]*$/).min(1).max(100).required()
        })

        //validate json
        var valid = schema.validate(req.body)
        if(valid.error) {
            var label = valid.error.details[0].context.label
            if(label == "username") res.status(400).json({error: "Username must be between 1 and 30 characters and only contain letters, numbers, and underscores"})
            if(label == "password") res.status(400).json({error: "Password must be between 1 and 100 characters and only contain letters, numbers, and underscores"})
            return res.status(400).json({error: "Something went wrong"})
        }

        //get userid from username/email/phone
        var results = await client.pipeline()
        .get(`username:${req.body.username}`)
        .get(`email:${req.body.username}`)
        .get(`phone:${req.body.username}`)
        .exec()

        var userid = results[0][1] || results[1][1] || results[2][1]

        //check if username or password exist
        if(!userid) return res.status(401).json({"error": "invalid username or password"})
        if(!await bcrypt.compare(req.body.password, await client.hget(`userid:${userid}`, "password"))) return res.status(401).json({"message": "incorrect username or passsword"})

        //jwt + send auth cookie
        var token = jwt.sign({userid: userid}, process.env.TOKEN_SECRET, {expiresIn: "24h"})
        res.cookie('authorization', `bearer ${token}`, { httpOnly: true, sameSite: 'Strict'})

        return res.status(200).json({"status": "ok", "token": token})
    }
    catch(e) {
        console.log("error in /login route ==", e)
        return res.sendStatus(500)
    }
})

router.post("/register", async (req, res) => {
    try {
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //DONT FORGET AREA CODE LATER ON
        const schema = Joi.object().keys({
            username: Joi.string().alphanum().min(5).max(30).required(),
            password: Joi.string().regex(/^[a-zA-Z0-9!@#$%^&*]{10,100}$/).required(),
            email: Joi.string().email().min(3).max(100).required(),
            phone: Joi.string().regex(/^[0-9]{10}$/).required(),
        })

        var valid = schema.validate(req.body)
        if(valid.error) {
            var label = valid.error.details[0].context.label
            if(label == "username") return res.status(400).json({error: "Username must be between 5 and 30 characters and only contain letters, numbers, and underscores"})
            if(label == "password") return res.status(400).json({error: "Password must be between 10 and 100 characters and only contain letters, numbers, and underscores"})
            if(label == "email") return res.status(400).json({error: "Email must be between 3 and 100 characters and must be a valid email"})
            if(label == "phone") return res.status(400).json({error: "Phone must be a valid phone number"})
            return res.status(500).json({error: "Something went wrong"})
        }

        //hash password first to prevent duplicate users with multiple requests
        var hashpass = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_ROUNDS))

        //check if username and email exists
        var results = await client.pipeline()
        .get(`username:${req.body.username}`)
        .get(`email:${req.body.email}`)
        .get(`phone:${req.body.phone}`)
        .exec()
        if(results[0][1] || results[1][1] || results[2][1]) return res.status(422).json({"error": "username, email, or phone already exists"})

        var userid = nanoid(25)

        //create userid
        await client.pipeline()
        .set(`username:${req.body.username}`, userid)
        .set(`email:${req.body.email}`, userid)
        .set(`phone:${req.body.phone}`, userid)
        .hset(`userid:${userid}`,
        [
            "username", req.body.username,
            "email", req.body.email,
            "userid", userid,
            "password", hashpass,
            "icon", "Flowchart.png",
            "icon_frame", 0,
            "is_admin", 0,
            "is_sadmin", 0,
            "is_deleted", 0,
            "is_verified", 0,
            "join_date", Math.floor(new Date().getTime() / 1000),
            "desc", "",
        ])
        .exec()

        //success
        return res.status(200).json({"status": "ok", "message": "succesfully created account"})
    }
    catch(e) {
        console.log("error in /signup route ==", e)
        return res.sendStatus(500)
    }
})

router.post("/logout", (req, res) => {
    res.set({'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API})
    res.clearCookie('authorization')
    return res.sendStatus(200)
})

router.use(cors())
module.exports = router

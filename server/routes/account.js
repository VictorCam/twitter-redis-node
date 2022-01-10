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

//FIND STICKERS BY INDEXING THE ONES THEY ALREADY HAVE
//MISSING A LOGGING OUT REQUEST
//do more tests like this https://www.youtube.com/watch?v=NKZ0ahNbmak

router.post("/login", async (req, res) => {
    try {
        //set headers
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //uesrname is going to allow email thus @ . are allowed
        //dont forget that username can contain a number
        const schema = Joi.object().keys({
            username: Joi.string().regex(/^[a-zA-Z0-9@._-]{1,200}$/).required(),
            password: Joi.string().regex(/^[a-zA-Z0-9!@#$%^&*_-]{10,100}$/).required(),
        })

        //validate json
        var valid = schema.validate(req.body)
        if(valid.error) {
            var label = valid.error.details[0].context.label
            if(label == "username") return res.status(400).json({"error": "invalid characters in username"})
            if(label == "password") return res.status(400).json({"error": "invalid characters in password"})
            return res.status(400).json({"error": "something went wrong"})
        }

        //get userid from username/email/phone
        var results = await client.pipeline()
        .get(`username:${req.body.username}`)
        .get(`email:${req.body.username}`)
        .get(`phone:${req.body.username}`)
        .exec()

        var userid = results[0][1] || results[1][1] || results[2][1]

        //check if username or password exist
        if(!userid) return res.status(401).json({"error": "username, email, or phone is not found"})
        if(!await bcrypt.compare(req.body.password, await client.hget(`userid:${userid}`, "password"))) return res.status(401).json({"error": "invalid password"})

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

//note that there can be two similar but diff type of usernames
//for example, ALBERT is different than albert or alBeRt

router.post("/register", async (req, res) => {
    try {
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //DONT FORGET AREA CODE LATER ON
        //DONT FORGET SOME USERS WILL ENTER - on the phone number
        //lowercase the username
        const schema = Joi.object().keys({
            username: Joi.string().regex(/^[a-zA-Z0-9_-]{1,30}$/).required(),
            password: Joi.string().regex(/^[a-zA-Z0-9!@#$%^&*_-]{10,100}$/).required(),
            email: Joi.string().email().min(5).max(200).required(),
            phone: Joi.string().regex(/^[0-9]{10}$/).required(),
        })

        var valid = schema.validate(req.body)
        if(valid.error) {
            var label = valid.error.details[0].context.label
            if(label == "username") return res.status(400).json({"error": "username must be between 1 and 30 characters and only contain letters, numbers, and underscores"})
            if(label == "password") return res.status(400).json({"error": "password must be between 10 and 100 characters and can only contain 'a-z A-Z 0-9 ! @ # $ % ^ & * _ -' only"})
            if(label == "email") return res.status(400).json({"error": "email must be between 5 and 100 characters and must be a valid email"})
            if(label == "phone") return res.status(400).json({"error": "phone must be a valid phone number"})
            return res.status(500).json({"error": "something went wrong"})
        }

        //check if username and email exists
        var results = await client.pipeline()
        .get(`username:${req.body.username}`)
        .get(`email:${req.body.email}`)
        .get(`phone:${req.body.phone}`)
        .exec()

        if(results[0][1]) return res.status(400).json({"error": "username already exists"})
        if(results[1][1]) return res.status(400).json({"error": "email already exists"})
        if(results[2][1]) return res.status(400).json({"error": "phone number already exists"})

        //hash password first to prevent duplicate users with multiple requests
        var hashpass = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_ROUNDS))


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
            "admin_level", 0,
            "is_deleted", 0,
            "is_verified", 0,
            "join_date", Math.floor(Date.now() / 1000),
            "desc", ""
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

router.get("/user/:username", async (req, res) => {
    try {
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //validate json schema
        const schema = Joi.object().keys({
            username: Joi.string().regex(/^[a-zA-Z0-9_-]{1,30}$/).required(),
        })

        var valid = schema.validate(req.params)
        if(valid.error) {
            var label = valid.error.details[0].context.label
            if(label == "username") return res.status(400).json({"error": "username must be between 1 and 30 characters and only contain letters, numbers, and underscores"})
            return res.status(500).json({"error": "something went wrong"})
        }

        //get userid from username
        var userid = await client.get(`username:${req.params.username}`)

        //check if username exists
        if(!userid) return res.status(400).json({"error": "username is not found"})

        //get user info
        var user = await client.hmget(`userid:${userid}`, "username", "email", "userid", "icon", "icon_frame", "admin_level", "is_deleted", "is_verified", "join_date", "desc")

        //convert user array into object
        user = {
            username: user[0],
            email: user[1],
            userid: user[2],
            icon: user[3],
            icon_frame: user[4],
            admin_level: user[5],
            is_deleted: user[6],
            is_verified: user[7],
            join_date: user[8],
            desc: user[9]
        }

        //success
        return res.status(200).json(user)
    }
    catch(e) {
        console.log("error in /user/:username route ==", e)
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

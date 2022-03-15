const jwt = require("jsonwebtoken")
const express = require("express")
const cors = require("cors")
const { hash, verify, Algorithm } = require('@node-rs/argon2');
const {client, rclient} = require("../server_connection")
const {nanoid} = require('nanoid')
const check_token = require("../middleware/check_token")
const router = express.Router()
const Joi = require("joi")
require("dotenv").config()

//FIND STICKERS BY INDEXING THE ONES THEY ALREADY HAVE
//MISSING A LOGGING OUT REQUEST
//do more tests like this https://www.youtube.com/watch?v=NKZ0ahNbmak
//uesrname is going to allow email thus @ . are allowed
//dont forget that username can contain a number
//also remember to check if the username is already taken by matching it with the userid

router.post("/login", async (req, res) => {
    try {
        //set headers
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //validate object
        const schema = Joi.object().keys({
            username: Joi.string().regex(/^[a-zA-Z0-9@._-]{1,200}$/).required().label("invalid characters in username"),
            password: Joi.string().regex(/^[a-zA-Z0-9!@#$%^&*_-]{10,100}$/).required().label("invalid characters in password"),
        })
        let valid = schema.validate(req.body)
        if(valid.error) {
            if(valid.error.details[0].type !== 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
            return res.status(400).json({"error": "invalid user input"})
        }

        //get userid from either the username/email/phone
        let results = await client.pipeline()
        .get(`username:${req.body.username}`)
        .get(`email:${req.body.username}`)
        .get(`phone:${req.body.username}`)
        .exec()

        //check if any of the results are not null and set the userid if
        let userid = results[0][1] || results[1][1] || results[2][1]

        //check if username or password exists and that the password is correct
        if(!userid) return res.status(401).json({"error": "username, email, or phone is not found"})
        if(!await verify(await client.hget(`userid:${userid}`, "password"), req.body.password, {secret: Buffer.from(process.env.ARGON2_SECRET, 'base64')})) return res.status(401).json({"error": "invalid password"})

        //set jwt + set auth cookie
        let token = jwt.sign({userid: userid}, process.env.TOKEN_SECRET, {expiresIn: "24h"})
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
//DONT FORGET AREA CODE LATER ON
//DONT FORGET SOME USERS WILL ENTER - on the phone number
//lowercase the username

router.post("/register", async (req, res) => {
    try {
        //set headers
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //validate object
        const schema = Joi.object().keys({
            username: Joi.string().regex(/^[a-zA-Z0-9_-]{1,30}$/).required().label("username must be between 1 and 30 characters and only contain letters, numbers, and underscores"),
            password: Joi.string().regex(/^[a-zA-Z0-9!@#$%^&*_-]{10,100}$/).required().label("password must be between 10 and 100 characters and only contain letters, numbers, and the following symbols: !@#$%^&*_"),
            email: Joi.string().email().min(5).max(200).required().label("email must be between 5 and 200 characters and must be a valid email address"),
            phone: Joi.string().regex(/^[0-9]{10}$/).required().label("phone must be 10 digits and only contain numbers"),
        })
        let valid = schema.validate(req.body)
        if(valid.error) {
            if(valid.error.details[0].type !== 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
            return res.status(400).json({"error": "invalid user input"})
        }

        //check if username email or phone exists
        let results = await client.pipeline()
        .get(`username:${req.body.username}`)
        .get(`email:${req.body.email}`)
        .get(`phone:${req.body.phone}`)
        .exec()

        //check if any of the results exists if so return error
        if(results[0][1]) return res.status(400).json({"error": "username already exists"})
        if(results[1][1]) return res.status(400).json({"error": "email already exists"})
        if(results[2][1]) return res.status(400).json({"error": "phone number already exists"})

        //hash password first to prevent duplicate user
        let hashpass = await hash(req.body.password, {
            algorithm: Algorithm.Argon2id, timeCost: parseInt(process.env.ARGON2_TIME_COST),
            memoryCost: parseInt(process.env.ARGON2_MEM_COST),
            parallelism: parseInt(process.env.ARGON2_NUM_THREADS),
            secret: Buffer.from(process.env.ARGON2_SECRET, 'base64')})

        //create userid
        let userid = nanoid(parseInt(process.env.NANOID_LEN))

        //create user
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

        return res.status(200).json({"status": "ok", "message": "succesfully created account"})
    }
    catch(e) {
        console.log("error in /signup route ==", e)
        return res.sendStatus(500)
    }
})

router.get("/user/:username", async (req, res) => {
    try {
        //set headers
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //validate json schema
        const schema = Joi.object().keys({
            username: Joi.string().regex(/^[a-zA-Z0-9_-]{1,30}$/).required().label("username must be between 1 and 30 characters and only contain letters, numbers, and underscores"),
        })
        let valid = schema.validate(req.params)
        if(valid.error) {
            if(valid.error.details[0].type !== 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
            return res.status(400).json({"error": "invalid user input"})
        }

        //get userid from username and check if username exists
        let userid = await client.get(`username:${req.params.username}`)
        if(!userid) return res.status(400).json({"error": "username is not found"})

        //get neccesary user info
        let user = await client.hmget(`userid:${userid}`, "username", "email", "userid", "icon", "icon_frame", "admin_level", "is_deleted", "is_verified", "join_date", "desc")

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

        return res.status(200).json(user)
    }
    catch(e) {
        console.log("error in /user/:username route ==", e)
        return res.sendStatus(500)
    }
})

router.post("/logout", (req, res) => {
    try {
        //set headers and removing cookies
        res.set({'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API})
        res.clearCookie('authorization')
        return res.sendStatus(200)
    }
    catch(e) {
        console.log("error in /logout route ==", e)
        return res.sendStatus(500)
    }
})

router.use(cors())
module.exports = router

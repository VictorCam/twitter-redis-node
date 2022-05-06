/*
 * Author: GitHub @VictorCam
 */

const express = require("express")
const { V3 } = require('paseto')
const { hash, verify, Algorithm } = require('@node-rs/argon2')
const { nanoid } = require('nanoid')
const base62 = require("base62/lib/ascii")
const router = express.Router()
require("dotenv").config()
const Joi = require('joi')

const { client, rclient } = require("../server_connection")
const check_token = require("../middleware/check_token")
const tc = require("../middleware/try_catch")
const { v_username, v_email, v_password } = require("../middleware/validation")

// login
// check if the user has a valid jwt token or valid csrf token already if they do then prevent a generation of a new csrf

// login_add route?

// signup
// check if the user has a token if they do prevent the signup route

router.post("/login", tc(async (req, res) => {
    //set headers
    res.set({'Accept': 'application/json'})

    //validate object
    const schema = Joi.object().keys({
        "username": v_username,
        "email": v_email,
        "password": v_password.required(),
    }).xor("username", "email").label("only use the username or email for logging in")
    let valid = schema.validate(req.body)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //get the userid from the username or email and the time to live (if user is not verified)
    let pipeline = client.pipeline()
    if(req.body.username) {
        pipeline.get(`username:${req.body.username}`)
        pipeline.ttl(`username:${req.body.username}`)
    }
    if(req.body.email) {
        pipeline.get(`email:${req.body.email}`)
        pipeline.ttl(`email:${req.body.email}`)
    }
    let [[,userid], [,ttl]] = await pipeline.exec()

    //check if the userid exists and if ttl isn't -1 then user isn't verified
    if(userid == null) return res.status(401).json({"error": "username/email not found"})

    //check if they have verified their account by checking the ttl isn't -1
    if(ttl != -1) return res.status(401).json({"error": "please verify your account on your email before logging in"})

    //get the password and the refreshid
    let userdata = await client.hmget(`userid:${userid}`, ["password", "refreshid"])

    //check if password is correct by comparing the argon password
    if(!await verify(userdata[0], req.body.password, {secret: Buffer.from(process.env.ARGON2_SECRET, 'base64')})) return res.status(401).json({"error": "invalid password"})

    //generate a csrf token
    let csrf = nanoid(36)

    //set token + set auth cookie
    let token = await V3.encrypt({"userid": userid, "refreshid": userdata[1], "csrf": csrf, "ts": Math.floor((Date.now()/1000))}, process.env.TOKEN_SECRET, {expiresIn: '7d'})
    res.cookie('authorization', token, { httpOnly: true, sameSite: 'Strict'})

    //return the token and the csrf where the cookie is set automatically and the token is sent in the header
    return res.status(200).json({"token": token, "csrf": csrf})
}))

router.post("/register", tc(async (req, res) => {
    //set headers
    res.set({'Accept': 'application/json'})

    //validate object
    const schema = Joi.object().keys({
        "username": v_username.required(),
        "email": v_email.required(),
        "password": v_password.required(),
    })
    let valid = schema.validate(req.body)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //hash password first to prevent duplicate user
    let hashpass = await hash(req.body.password, {
        algorithm: Algorithm.Argon2id, timeCost: parseInt(process.env.ARGON2_TIME_COST),
        memoryCost: parseInt(process.env.ARGON2_MEM_COST),
        parallelism: parseInt(process.env.ARGON2_NUM_THREADS),
        secret: Buffer.from(process.env.ARGON2_SECRET, 'base64')
    })

    //create userid
    let unix_ms = Date.now()
    let userid = base62.encode(unix_ms) + nanoid(parseInt(process.env.NANOID_LEN))

    //check if username or email exists
    let pipe = client.pipeline()
    pipe.get(`username:${valid.value.username}`)
    pipe.get(`email:${valid.value.email}`)
    let [[,username_exists], [,email_exists]] = await pipe.exec()

    //check if username or email is taken if so return error
    if(username_exists != null) return res.status(400).json({"error": "username already exists"})
    if(email_exists != null) return res.status(400).json({"error": "email already exists"})

    //if node_env == production  then send an email to the user with a verification link
    if(process.env.NODE_ENV == "") {
        //buy a custom email domain with unlimited email sending and we will send the email to the user using node-mailer OR api
    }

    //create user (the original username value will be displayed in the frontend)
    let pipeline = client.pipeline()
    pipeline.set(`username:${valid.value.username}`, userid) //use the lowercased username
    pipeline.set(`email:${valid.value.email}`, userid) //use the lowercased email
    pipeline.hset(`userid:${userid}`,
    [
        "username", req.body.username,
        "email", valid.value.email,
        "userid", userid,
        "password", hashpass,
        "icon", "icon.png",
        "icon_frame", 0,
        "admin_level", 0,
        "is_user_banned", 0,
        "is_user_locked", 0,
        "is_user_verified", 0,
        "join_date", unix_ms,
        "desc", "",
        "refreshid", userid
    ])

    //if production is 1 then expire following keys after 24 hours
    if(process.env.NODE_ENV == "") {
        pipeline.expire(`userid:${userid}`, process.env.EXPIRE_ACCOUNT)
        pipeline.expire(`username:${valid.value.username}`, process.env.EXPIRE_ACCOUNT)
        pipeline.expire(`email:${valid.value.email}`, process.env.EXPIRE_ACCOUNT)
    }

    //execute the following pipelined commands
    pipeline.exec()

    return res.sendStatus(200)
}))

router.get("/user/:username", tc(async (req, res) => {
    //set headers
    res.set({'Accept': 'application/json'})

    //validate json schema
    const schema = Joi.object().keys({
        "username": v_username.required()
    })
    let valid = schema.validate(req.params)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //get userid from username and check if username exists
    let userid = await client.get(`username:${req.params.username}`)
    if(userid == null) return res.status(400).json({"error": "username is not found"})

    //get neccesary user info
    let user = await client.hgetall(`userid:${userid}`)

    //delete sensitive information
    delete user.password
    delete user.email

    return res.status(200).json(user)
}))

router.post("/logout", tc((req, res) => {
    // remove cookies
    res.clearCookie('authorization')
    return res.sendStatus(200)
}))

module.exports = router
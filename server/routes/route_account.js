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

//note to self getting a value that comes from a differnt
//type causes an error to occur

router.get("/test", async (req, res) => {
    //set headers
    // var result = await client.hexists("post:8e4vYfI36BfvRs5MVUMaXtTUN", "userid")
    // console.log(result)
    return res.status(200).json({"success": "test"})
})


router.post("/login", async (req, res) => {
    try {
        //set headers
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //schema (username can be email or password)
        // const schema = Joi.object({
        //     username: Joi.string().alphanum().min(1).max(20).required(),
        //     password: Joi.string().alphanum().min(1).max(100).required(),
        // })

        // //validate json
        // var valid = schema.validate(req.body)
        // if(valid.error) return res.status(422).json({"error": "invalid or missing json key value"})

        //get userid from username/email/phone
        var results = await client.pipeline()
        .get(`username:${req.body.username}`)
        .get(`email:${req.body.username}`)
        .get(`phone:${req.body.username}`)
        .exec()

        var userid = results[0][1] || results[1][1] || results[2][1]

        //check if userid does not exist and check the password is correct
        if(!userid) return res.status(409).json({"error": "username does not exist"})
        if(!await bcrypt.compare(req.body.password, await client.hget(`userid:${userid}`, "password"))) return res.status(401).json({"message": "incorrect username or passsword"})

        //jwt + send auth cookie
        var token = jwt.sign({userid: userid}, process.env.TOKEN_SECRET, {expiresIn: "24h"})
        res.cookie('authorization', `bearer ${token}`, { httpOnly: true, sameSite: 'Strict'})

        //success
        return res.status(200).json({"status": "ok", "token": token})
    }
    catch(e) {
        console.log("error in /login route ==", e)
        return res.sendStatus(500)
    }
})

router.post("/register", async (req, res) => {
    try {
        //set headers
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API, 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //schema
        // const schema = Joi.object({
        //     username: Joi.string().alphanum().min(1).max(20).required(),
        //     password: Joi.string().alphanum().min(1).max(100).required(),
        //     email: Joi.string().regex(/^[.@A-Za-z0-9]+$/).min(1).max(100).required(),
        //     phone: Joi.string().alphanum().min(1).max(15).required()
        // })

        //validate json
        // var valid = schema.validate(req.body)
        // if(valid.error) return res.status(422).json({"error": "invalid or missing key value"})

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

router.get("/logout", (req, res) => {
    res.set({'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': process.env.CLIENT_API})
    res.clearCookie('authorization')
    return res.sendStatus(200)
})

router.get("/user", check_token(false), (req, res) => {
    return res.status(200).json(req.id.toString())
})


// const val_profile = ajv.compile({ type: 'integer' })
router.get("/profile/:id", check_token(), async (req, res) => {
    try {
        //set headers

        //validate json
        // val_profile(parseInt(req.params.id))
        if(val_profile.errors) return res.status(422).json({"error": val_profile.errors[0].message})

        //queries
        var conn = await pool.getConnection()
        var rows = await conn.query("SELECT * FROM user_tables WHERE ID = ?", [req.params.id])
        if(rows.length == 1) return res.status(200).json(rows[0])
        if(rows.length == 0) return res.status(200).json({"message": "no user found"})
        await conn.release()

        return res.sendStatus(500) //fall over here if something happens
    }
    catch(e) {
        conn.destroy()
        console.log("error in /profile route ==", e)
        return res.sendStatus(500)
    }
})

router.post("/profile_pic", check_token(), async (req, res) => { //unsecure method of saving and not async and not using streams
    try {
        const form = new formidable.IncomingForm()
        form.parse(req)
        form.on('fileBegin', async function (name, file) {
            file.path = './uploads/' + file.name //prevent image collissions

            //queries
            var conn = await pool.getConnection()
            await conn.query("UPDATE user_tables SET icon = (?) WHERE user_tables.ID = (?)", [file.name, req.id])
            await conn.release()

            return res.sendStatus(200)
        })
    }
    catch(e) {
        conn.destroy()
        console.log("error in /profile_pic route ==", e)
        return res.sendStatus(500)
    }
})

router.use(cors())
module.exports = router

const jwt = require("jsonwebtoken")
const express = require("express")
const cors = require("cors")
const bcrypt = require('bcrypt')
const formidable = require('formidable')
const {client, sclient} = require("../server_connection")
const {nanoid} = require('nanoid')
const check_token = require("../middleware/check_token")
const router = express.Router()
const Joi = require("joi")
require("dotenv").config()

router.get("/test", async (req, res) => {

    return res.status(200).json({"success": await client.get('framework')})
})


router.post("/login", async (req, res) => {
    try {
        //set headers
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': 'http://localhost:8080', 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //schema
        const schema = Joi.object({
            username: Joi.string().alphanum().min(1).max(20).required(),
            password: Joi.string().alphanum().min(1).max(100).required(),
        })

        //validate json
        var valid = schema.validate(req.body)
        if(valid.error) return res.status(422).json({"error": "invalid or missing key value"})

        //check if user does not exist and check the password
        if(await client.exists("user:"+req.body.username) == 0) return res.status(409).json({"error": "username does not exist"})
        if(!await bcrypt.compare(req.body.password, await client.hget("user:"+req.body.username, "password"))) return res.status(401).json({"message": "incorrect username or passsword"})

        //jwt + send cookies
        var token = jwt.sign({userid: await client.hget("user:"+req.body.username, "userid")}, process.env.TOKEN_SECRET, {expiresIn: "24h"})
        res.cookie('authorization', `bearer ${token}`, { httpOnly: true, sameSite: 'Strict'})
        res.cookie('auth_state', 'true', {signed: true})

        //success
        return res.status(200).json({"status": "ok", "token": token})
    }
    catch(e) {
        console.log("error in /login route ==", e)
        return res.sendStatus(500)
    }
})

router.post("/signup", async (req, res) => {
    try {
        //set headers
        res.set({'Accept': 'application/json', 'Content-Type': 'application/json'})

        //schema
        const schema = Joi.object({
            username: Joi.string().alphanum().min(1).max(20).required(),
            password: Joi.string().alphanum().min(1).max(100).required(),
            email: Joi.string().regex(/^[@A-Za-z0-9]+$/).min(1).max(100).required()
        })

        //validate json
        var valid = schema.validate(req.body)
        if(valid.error) return res.status(422).json({"error": "invalid or missing key value"})

        //SEARCH IF USERNAME OR EMAIL EXIST
        // if(await client.exists("user:"+req.body.username) == 1) return res.status(409).json({"error": "username is already taken"})

        //hash password
        var hashpass = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_ROUNDS))

        //create uid and create a userid key pointer 
        var uid = nanoid(25)

        var data = {
            "username": req.body.username,
            "email": req.body.email,
            "userid": uid,
            "password": hashpass,
            "icon": "Flowchart.png",
            "is_admin": 0,
            "is_deleted": 0
        }

        var sdata = {
            "username": req.body.username,
            "email": req.body.email,
            "userid": uid,
        }

        //loop userid username and email
        sclient.connect()
        for(const prop in sdata) await sclient.hset("userid"+uid, prop, sdata[prop])
        sclient.disconnect()

        //create user kvrocks
        for(const prop in data) await client.hset("userid:"+uid, prop, data[prop])

        //success
        return res.status(200).json({"status": "ok", "message": "succesfully created account"})
    }
    catch(e) {
        console.log("error in /signup route ==", e)
        return res.sendStatus(500)
    }
})

router.get("/logout", (req, res) => {
    res.set({'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': 'http://localhost:8080'})
    res.clearCookie('authorization')
    res.cookie('auth_state', 'false')
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

const jwt = require("jsonwebtoken")
const express = require("express")
const cors = require("cors")
const bcrypt = require('bcrypt')
const formidable = require('formidable')
const pool = require("../server_connection")
const check_token = require("../middleware/check_token")
const router = express.Router()
const Ajv = require('ajv').default
const ajv = new Ajv()
require("dotenv").config()


const val_login = ajv.compile({
    type: 'object', required: ['username', 'password'], additionalProperties: false,
    properties: {
        username: { type: 'string', minLength: 1, maxLength: 100 },
        password: { type: 'string', minLength: 1, maxLength: 100 }
    }
})
router.post("/login", async (req, res) => {
    try {
        //set headers
        res.set({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': 'http://localhost:8080', 'Accept': 'application/json', 'Content-Type': 'application/json'})

        //validate json
        val_login(req.body)
        if(val_login.errors) return res.status(422).json({"error": val_login.errors[0].dataPath, "message": val_login.errors[0].message})

        //queries
        var conn = await pool.getConnection()
        var rows = await conn.query("SELECT ID, Password FROM user_tables WHERE user_tables.Name = ?", [req.body.username])
        if(rows.length == 0)  return res.status(401).json({"error": "incorrect username or password"})
        await conn.end()

        //compare password
        if(!await bcrypt.compare(req.body.password, rows[0].Password)) return res.status(401).json({"message": "incorrect username or passsword"})

        //jwt + send cookies
        var token = jwt.sign({id: rows[0].ID}, process.env.TOKEN_SECRET, {expiresIn: "24h"})
        res.cookie('authorization', `bearer ${token}`, { httpOnly: true, sameSite: 'Strict'})
        res.cookie('auth_state', 'true', {signed: true})

        //success
        return res.status(200).json({"status": "ok", "token": token})
    }
    catch(e) {
        conn.destroy()
        console.log("error in /login route ==", e)
        return res.sendStatus(500)
    }
})

const val_signup = ajv.compile({
    type: 'object', required: ['username', 'password'], additionalProperties: false,
    properties: {
        username: { type: 'string', minLength: 1, maxLength: 100 },
        password: { type: 'string', minLength: 1, maxLength: 100 }
    }
})
router.post("/signup", async (req, res) => {
    try {
        //set headers
        res.set({'Accept': 'application/json', 'Content-Type': 'application/json'})

        //validate json
        val_signup(req.body)
        if(val_signup.errors) return res.status(422).json({"error": val_signup.errors[0].dataPath, "message": val_signup.errors[0].message})

        //hash password
        var hashedPassword = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_ROUNDS))

        //queries
        var conn = await pool.getConnection()
        await conn.beginTransaction()
        var rows1 = await conn.query("SELECT Password FROM user_tables WHERE user_tables.name = ?", [req.body.username])
        if(rows1.length == 1) { await conn.rollback(); return res.status(409).json({"error": "username is already taken"}) }
        await conn.query("INSERT INTO user_tables(Name, Password, icon) VALUES(?, ?, ?)", [req.body.username, hashedPassword, "Flowchart.png"])
        await conn.commit(); await conn.release()

        //success
        console.log("account created")
        return res.status(200).json({"status": "ok", "message": "succesfully created account"})
    }
    catch(e) {
        await conn.rollback(); conn.destroy()
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


const val_profile = ajv.compile({ type: 'integer' })
router.get("/profile/:id", check_token(), async (req, res) => {
    try {
        //set headers

        //validate json
        val_profile(parseInt(req.params.id))
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

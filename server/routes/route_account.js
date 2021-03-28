const jwt = require("jsonwebtoken")
const express = require("express")
const cors = require("cors")
const bcrypt = require('bcrypt')
const formidable = require('formidable')
const connectsql = require("../server_connection")
const check_token = require("../middleware/check_token")
const router = express.Router()
const Ajv = require('ajv').default
const ajv = new Ajv()
require("dotenv").config()

const login = {
    type: 'object', required: ['username', 'password'], additionalProperties: false,
    properties: {
        username: { type: 'string', minLength: 1, maxLength: 100 },
        password: { type: 'string', minLength: 1, maxLength: 100 }
    }
}

const signup = {
    type: 'object', required: ['username', 'password'], additionalProperties: false,
    properties: {
        username: { type: 'string', minLength: 1, maxLength: 100 },
        password: { type: 'string', minLength: 1, maxLength: 100 }
    }
}

const profile = { type: 'integer' }

const val_login = ajv.compile(login)
const val_signup = ajv.compile(signup)
const val_profile = ajv.compile(profile)


router.post("/login", async (req, res) => {
    try {
        res.set({
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Origin': 'http://localhost:8080',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })

        val_login(req.body)
        if(val_login.errors) return res.status(422).json({"error": val_login.errors[0].dataPath, "message": val_login.errors[0].message})

        const sql = "SELECT ID, Password FROM user_tables WHERE user_tables.Name = ?"
        var [rows, fields] = await connectsql.promise().query(sql, [req.body.username])

        if(rows.length == 0) { console.log("user does not exist"); return res.sendStatus(401) }
        if(!await bcrypt.compare(req.body.password, rows[0].Password)) return res.status(401).json({"message": "incorrect username or passsword"})

        var token = jwt.sign({id: rows[0].ID}, process.env.TOKEN_SECRET, {expiresIn: "24h"})
        res.cookie('authorization', `bearer ${token}`, { httpOnly: true, sameSite: 'Strict'})
        res.cookie('auth_state', 'true', {signed: true})
        return res.status(200).json({"status": "ok", "token": token})
    }
    catch(e) {
        console.log("error in /login route ==", e)
        return res.sendStatus(500)
    }
})

router.post("/signup", async (req, res) => {
    try {
        res.set({'Accept': 'application/json', 'Content-Type': 'application/json'})

        val_signup(req.body)
        if(val_signup.errors) return res.status(422).json({"error": val_signup.errors[0].dataPath, "message": val_signup.errors[0].message})

        var hashedPassword = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_ROUNDS))
        
        //first query
        const sql1 = "SELECT Password FROM user_tables WHERE user_tables.name = ?"
        var [rows1, fields1] = await connectsql.promise().query(sql1, [req.body.username])
    
        if(rows1.length == 1) return res.status(409).json({"error": "username is already taken"})

        //second query
        const sql2 = "INSERT INTO user_tables(Name, Password, icon) VALUES(?, ?, ?)"
        var [rows2, fields2] = await connectsql.promise().query(sql2, [req.body.username, hashedPassword, "Flowchart.png"])

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

router.get("/profile/:id", check_token(), async (req, res) => {
    try {
        val_profile(parseInt(req.params.id))
        if(val_profile.errors) return res.status(422).json({"error": val_profile.errors[0].message})

        const sql = "SELECT * FROM user_tables WHERE ID = ?"
        var [rows, fields] = await connectsql.promise().query(sql, [req.params.id])
        if(rows.length == 1) return res.status(200).json(rows[0])
        if(rows.length == 0) return res.status(200).json({"message": "no user found"})
        return res.sendStatus(500) //fall over here if something happens
    }
    catch(e) {
        console.log("error in /profile route ==", e)
        return res.sendStatus(500)
    }
})

router.post("/profile_pic", check_token(), async (req, res) => { //unsecure method of saving and not async and not using streams
    try {
        const form = new formidable.IncomingForm()
        form.parse(req)
        form.on('fileBegin', async function (name, file){
            file.path = './uploads/' + file.name

            const sql = "UPDATE user_tables SET icon = (?) WHERE user_tables.ID = (?)"
            var [rows, fields] = await connectsql.promise().query(sql, [file.name, req.id])
            return res.sendStatus(200)
        })
    }
    catch(e) {
        console.log("error in /profile_pic route ==", e)
        return res.sendStatus(500)     
    }
})

router.use(cors())

module.exports = router

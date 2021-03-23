const jwt = require("jsonwebtoken")
const cookie = require("cookie")
const express = require("express")
const cors = require("cors")
const bcrypt = require('bcrypt')
const formidable = require('formidable')
const connectsql = require("../server_connection")
const check_token = require("../middleware/check_token")
const router = express.Router()
const Ajv = require('ajv')
const ajv = new Ajv()

require("dotenv").config()


router.post("/login", async (req, res) => {
    try {
        res.set({'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': 'http://localhost:8080'})
        const schema = {
            type: 'object', required: ['username', 'password'], additionalProperties: false,
            properties: {
                username: { type: 'string', minLength: 1, maxLength: 100 },
                password: { type: 'string', minLength: 1, maxLength: 100 }
            }
        }
        const validate = ajv.compile(schema)
        validate(req.body)
        if(validate.errors) return res.status(422).send({"error": validate.errors[0].dataPath, "message": validate.errors[0].message})
    

        const sql = "SELECT ID, Password FROM user_tables WHERE user_tables.Name = ?"
        var [rows, fields] = await connectsql.promise().query(sql, [req.body.username])

        if(rows.length == 0) { console.log("user does not exist"); return res.sendStatus(401) }
        if(!await bcrypt.compare(req.body.password, rows[0].Password)) { console.log("incorrect username and/or password"); return res.sendStatus(401) }

        var token = jwt.sign({id: rows[0].ID}, process.env.TOKEN_SECRET, {expiresIn: "24h"})
        res.cookie('authorization', `bearer ${token}`, { httpOnly: true, sameSite: 'Strict'})
        res.cookie('auth_state', 'true', {signed: true})
        return res.status(200).json("status: ok")
    }
    catch(e) {
        console.log("error in /login route ==", e)
        return res.sendStatus(500)
    }
})

router.post("/signup", async (req, res) => {
    try {
        const schema = {
            type: 'object', required: ['username', 'password'], additionalProperties: false,
            properties: {
                username: { type: 'string', minLength: 1, maxLength: 100 },
                password: { type: 'string', minLength: 1, maxLength: 100 }
            }
        }
        const validate = ajv.compile(schema)
        validate(req.body)
        if(validate.errors) return res.status(422).send({"error": validate.errors[0].dataPath, "message": validate.errors[0].message})

        var hashedPassword = await bcrypt.hash(req.body.password, 10)
        
        //first query
        const sql1 = "SELECT Password FROM user_tables WHERE user_tables.name = ?"
        var [rows1, fields1] = await connectsql.promise().query(sql1, [req.body.username])
    
        if(rows1.length == 1) { console.log("user is already taken"); return res.status(409).send("Username is already taken") }

        //second query
        const sql2 = "INSERT INTO user_tables(Name, Password, icon) VALUES(?, ?, ?)"
        var [rows2, fields2] = await connectsql.promise().query(sql2, [req.body.username, hashedPassword, "Flowchart.png"])
        res.sendStatus(200)
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

router.get("/profile/:id", check_token(), (req, res) => {
    const schema = { type: 'integer' }
    var validate = ajv.compile(schema)
    validate(parseInt(req.params.id))
    if(validate.errors) return res.status(422).send({"message": validate.errors[0].message})

    var sql = "SELECT * FROM user_tables WHERE ID = ?"
    connectsql.query(sql, [req.params.id], function (err, data) {
            if (!err) {
              return res.status(200).send(data[0])
            } else {
                console.log("something went wrong during sign up")
            }
        })
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

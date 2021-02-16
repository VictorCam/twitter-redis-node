const jwt = require("jsonwebtoken")
const cookie = require("cookie")
const joi = require('joi')
const express = require("express")
const cors = require("cors")
const connectsql = require("../server_connection")
const check_token = require("../middleware/check_token")
const router = express.Router()
require("dotenv").config()

router.post("/login", (req, res) => {
    res.set({'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': 'http://localhost:8080'})
    const schema = joi.object({
        username: joi.string().min(1).max(100).required(),
        password: joi.string().min(1).max(100).required()
    })

    login = schema.validate(req.body)

    if(login.error) return res.status(422).json(login.error.details[0].message)

  const sql = "SELECT * FROM user_tables WHERE user_tables.Name = ? AND user_tables.Password= ?"
  connectsql.query(sql,[req.body.username, req.body.password], function(err, data) {
        if (!err && data.length == 1) {
            const token = jwt.sign({id: data[0].ID}, process.env.TOKEN_SECRET, {expiresIn: "24h"})
            res.setHeader('Set-Cookie', cookie.serialize('authorization', token, { httpOnly: true, sameSite: 'Strict'}))
            return res.sendStatus(200)
        }
        else {
            console.log("authentication failed")
            return res.status(401).send("invalid username or password")
        }
    })
})

router.post("/signup", (req, res) => {
    const schema = joi.object({
        username: joi.string().min(1).max(100).required(),
        password: joi.string().min(1).max(100).required()
    })

    signup = schema.validate(req.body)
    if(signup.error) return res.status(422).json(signup.error.details[0].message)


  var sql = "INSERT INTO user_tables(Name, Password) VALUES(?, ?)"
  connectsql.query(sql, [req.body.username, req.body.password], function (err, data) {
          if (!err) {
            return res.sendStatus(200)
          } 
          else {
              console.log("something went wrong during sign up")
          }
      })
})

router.get("/logout", (req, res) => {
    res.set({'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': 'http://localhost:8080'})
    res.cookie('authorization', 'false', { httpOnly: false })
    return res.sendStatus(200)
})

router.get("/user", check_token(), (req, res) => {
    return res.status(200).json(req.id.toString())
})

router.get("/profile/:id", check_token(), (req, res) => {
    const profile = joi.number().integer().required().min(1).validate(req.params.id)
    if(profile.error) return res.status(422).json(profile.error.details[0].message)

    var sql = "SELECT * FROM user_tables WHERE ID = ?"
    connectsql.query(sql, [req.params.id], function (err, data) {
            if (!err) {
              return res.status(200).send(data[0])
            } else {
                console.log("something went wrong during sign up")
            }
        })
})

router.use(cors())

module.exports = router

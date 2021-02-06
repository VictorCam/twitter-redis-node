const connectsql = require("../server_connection")
const express = require("express")
const router = express.Router()
const cors = require("cors")
const jwt = require("jsonwebtoken")
const cookie = require("cookie")
require("dotenv").config()
const check_token = require("../middleware/check_token")

router.post("/login", (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080')

  const sql = "SELECT * FROM user_tables WHERE user_tables.Name = ? AND user_tables.Password= ?"
  connectsql.query(sql,[req.body.username,req.body.password], function(err, data) {
          if (!err && data.length == 1) {
              const token = jwt.sign({id: data[0].ID}, process.env.TOKEN_SECRET, {expiresIn: "24h"})
              res.setHeader('Set-Cookie', cookie.serialize('authorization', token, { httpOnly: true, /*maxAge: now,*/ sameSite: 'Strict'}))
              return res.status(200).send(true)
          }
          else {
              console.log("authentication failed")
              return res.status(401).send("invalid username or password")
          }
      })
})

router.post("/signup", (req, res) => {
  var sql = "INSERT INTO user_tables(Name, Password) VALUES(?, ?)"
  connectsql.query(sql, [req.body.username, req.body.password], function (err, data) {
          if (!err) {
            console.log("sign up success!")
            return res.status(200)
          } else {
              console.log("something went wrong during sign up")
          }
      })
})

router.get("/logout", (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080')
    res.cookie('authorization', 'false', { httpOnly: false })
    return res.sendStatus(200)
})

router.get("/user", check_token(), (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080')
    return res.status(200).json(req.id.toString())
})

router.get("/profile/:id", check_token(), (req, res) => {
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

const connectsql = require("../server_connection")
const express = require("express")
const router = express.Router()
const cors = require("cors")
const jwt = require("jsonwebtoken")
const bcrpyt = require("bcrypt")
const cookie = require("cookie")
require("dotenv").config()

router.post("/login", (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080')

  const sql = "SELECT * FROM user_tables where user_tables.Name = ? AND user_tables.Password= ?";
  connectsql.query(sql,[req.body.username,req.body.password], function(err, rows) {
    console.log("SQL username + pasword:", req.body.username, " ", req.body.password);
          if (rows.length == 1) {
              console.log(rows[0].ID)

              const token = jwt.sign({user_ID: rows[0].ID}, process.env.TOKEN_SECRET, {expiresIn: "24h"});
              res.setHeader('Set-Cookie', cookie.serialize('Authorization', token, { httpOnly: true, /*maxAge: now,*/ sameSite: 'Strict'}))
              res.status(200).send(true)
          }
          else {
              console.log("authentication failed")
              res.status(401).end()
          }
      })
})

router.post("/signup", (req, res) => {
  var sql = "INSERT INTO user_tables(Name, Password) VALUES(?, ?)"
  connectsql.query(sql, [req.body.username.toString(), req.body.password.toString()], function (err, data) {
          if (!err) {
              res.status(200);
              console.log("sign up success!");
          } else {
              console.log("something went wrong during sign up");
          }
      })
})

router.use(cors());

module.exports = router;

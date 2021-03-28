const jwt = require("jsonwebtoken")
require("dotenv").config()

module.exports = function(...test) {
  return function (req, res, next) {
    res.set({
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Origin': 'http://localhost:8080',
    'Access-Control-Allow-Headers': 'Authorization'
    })

    try {
      var token = req.cookies['authorization'] || req.headers['authorization']
      if(!token) return no_auth(req, res, next)
      token = token.split(" ")
      if(token[0].toLowerCase() != 'bearer') return no_auth(req, res, next)
    }
    catch {
      return no_auth(req, res, next)
    }

    jwt.verify(token[1], process.env.TOKEN_SECRET, (err,user) => {
      if(!err) {
        req.id = user.id
        return next()
      }
      return no_auth(req, res, next)
    })
  }
}

function no_auth(req, res, next) {
  console.log("no auth")
  res.clearCookie('authorization')
  res.cookie('auth_state', 'false')
  return res.status(401).json({"Error": "auth not found"})
}
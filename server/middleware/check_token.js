const jwt = require("jsonwebtoken")
require("dotenv").config()

module.exports = function() {
  return function (req, res, next) {
    try {
      res.set({
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Origin': process.env.CLIENT_API,
      'Access-Control-Allow-Headers': 'Authorization'
      })
      var token = req.cookies['authorization'] || req.headers['authorization']
      if(!token) return no_auth(req, res, next)
      jwt.verify(token, process.env.TOKEN_SECRET, (err,user) => {
        if(!err) {
          req.userid = user.userid
          //we could store the permission level in the token
          return next()
        }
        return no_auth(req, res, next)
      })
    }
    catch {
      return no_auth(req, res, next)
    }
  }
}

function no_auth(req, res, next) {
  res.clearCookie('authorization')
  return res.status(401).json({"error": "auth not found"})
}
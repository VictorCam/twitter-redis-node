const jwt = require("jsonwebtoken")
require("dotenv").config()

module.exports = function(...test) {
  return function (req, res, next) {
    res.set({'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': 'http://localhost:8080'})
    try { 
      var token = getCookieValue('authorization', req) 
      if(typeof token === 'undefined') {
        res.cookie('authorization', 'false', { httpOnly: false} )
        return res.status(401).json("Error: auth not found")
      }
    }
    catch {
      res.cookie('authorization', 'false', { httpOnly: false} )
      return res.status(401).json("Error: auth not found")
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err,user) => {
      if(!err) {
        req.id = user.id
        return next()
      }
      res.cookie('authorization', 'false', { httpOnly: false} )
      return res.status(401).json("Error: invalid auth")
    })
  }
}

function getCookieValue(a,req) {
  var b = req.headers.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)')
  return b ? b.pop() : undefined
}
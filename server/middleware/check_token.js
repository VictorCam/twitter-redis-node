const jwt = require("jsonwebtoken")
require("dotenv").config()

module.exports = function() {
  return function (req, res, next) {
    //attempt to grab token if it exists
    try { 
      var token = getCookieValue('authorization', req) 
      if(typeof token === 'undefined') {
        console.log("ERROR #1: could not find authorization")
        res.cookie('auth', 'false', { sameSite: 'Lax'})
        return res.sendStatus(401)
      }
    }
    catch {
        console.log("ERROR #2: could not find authorization")
        res.cookie('auth', 'false', { sameSite: 'Lax'})
        return res.sendStatus(401)
    }

    //verify user
    jwt.verify(token, process.env.TOKEN_SECRET, (err,user) => {
      if(!err) {
        console.log("SUCCESS: valid jwt")
        res.cookie('auth', 'true', { sameSite: 'Lax'})
        req.id = user.id
        return next()
      }
      console.log("FAILURE #3: invalid jwt")
      res.clearCookie('authorization')

      // res.cookie('authorization', '', { httpOnly: false})
      res.cookie('auth', 'false', { sameSite: 'Lax'})
      return res.sendStatus(401)
    })
  }
}

function getCookieValue(a,req) {
  var b = req.headers.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)')
  return b ? b.pop() : undefined
}
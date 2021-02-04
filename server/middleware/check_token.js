const jwt = require("jsonwebtoken")
require("dotenv").config()

module.exports = async function(req,res,next) {
  try { var token = getCookieValue('Authorization', req) }
  catch {
      console.log("ERROR #1: could not find authorization (assuming guest)")
      // res.cookie('auth', 'false', { sameSite: 'Lax'})
      return res.sendStatus(401)
  }

  //assuming user with !token is a guest
  if(typeof token === 'undefined') {
    console.log("ERROR #2: could not find authorization (assuming guest)")
    // res.cookie('auth', 'false', { sameSite: 'Lax'})
    return res.sendStatus(401)
  }

  //verify user
  jwt.verify(token, process.env.TOKEN_SECRET, (err,user) => {
    if(!err) {
      console.log("SUCCESS: valid jwt")
      // res.cookie('auth', 'true', { sameSite: 'Lax'})
      req.user_ID = user.user_ID
      return next()
    }
    console.log("FAILURE: invalid jwt")
    // res.cookie('auth', 'false', { sameSite: 'Lax'})
    return res.sendStatus(401)
  })
}

function getCookieValue(a,req) {
  var b = req.headers.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)')
  return b ? b.pop() : undefined
}
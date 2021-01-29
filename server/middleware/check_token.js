const jwt = require("jsonwebtoken")
require("dotenv").config()

module.exports = function(req,res,next) {
    if(req.headers.cookie == null) { //check if cookie exist
      return next()
    }

    var key = getCookieValue('token', req) //do regex match since cookie exists
    if(!key) {
        return res.status(401).send("Access Denied") //if cookie name does not match then error out
    }

    jwt.verify(key,process.env.TOKEN_SECRET, (err,user) => {
    if(!err) {
        req.user_ID = user.user_ID //sending data to route
        return next()
      }
    else {
        // res.clearCookie('token') //maybe not clear the token just yet
        return res.status(403).send("Access Denied") //error if jwt is expired or invalid
    }
  })
}

function getCookieValue(a,req) {
  var b = req.headers.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)')
  return b ? b.pop() : ''
}
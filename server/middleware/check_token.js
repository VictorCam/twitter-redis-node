const jwt = require("jsonwebtoken")
const cookie = require("cookie")
require("dotenv").config()

module.exports = async function(req,res,next) {
  //find cookies
  try {
    var s_value = getCookieValue('vuex', req)
    var t_value = getCookieValue('Authorization', req)
    l_state = JSON.parse(decodeURIComponent(s_value)).auth.login
  } catch { console.log("ERROR: vuex cookie OR auth cookie") }

  //edge cases
  if(l_state === false && typeof t_value !== 'undefined' || l_state === true && typeof t_value === 'undefined') {
      res.clearCookie('vuex')
      res.clearCookie('Authorization')
      return res.sendStatus(401)
  }

  //guest
  if(l_state === false && t_value !== 'undefined') { return next() }

  //verify user
  jwt.verify(t_value, process.env.TOKEN_SECRET, (err,user) => {
    if(!err) {
      req.user_ID = user.user_ID
      console.log("valid user")
      return next()
    }
    else {
        res.clearCookie('vuex')
        res.clearCookie('Authorization')
        return res.sendStatus(401)
    }
  })
}

function getCookieValue(a,req) {
  var b = req.headers.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)')
  return b ? b.pop() : undefined
}
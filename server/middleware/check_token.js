const jwt = require("jsonwebtoken")
require("dotenv").config()

const { client } = require("../server_connection")

module.exports = function() {
  return function (req, res, next) {
    //set headers
    res.set({
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Origin': process.env.CLIENT_API,
    'Access-Control-Allow-Headers': 'Authorization'
    })

    //check if the token exists
    var token = req.cookies['authorization'] || req.headers['authorization']
    if(!token) return no_auth(req, res, next)

    //verify if jwt is valid
    jwt.verify(token, process.env.TOKEN_SECRET, async (err,user) => {

      //if token is invalid or is expired we trigger no_auth
      if(err) return no_auth(req, res, next)

      //check if 1 hour has passed since the token was issued
      if(user.iat + 3600 < (Date.now() / 1000)) {
        
        //check if refreshid was changed (changed when account is compromised)
        let refreshid = await client.hget(`userid:${user.userid}`, "refreshid")
        if(refreshid != user.refreshid) return no_auth(req, res, next)

        //reassign a fresh new token
        let token = jwt.sign({"userid": user.userid, "refreshid": refreshid}, process.env.TOKEN_SECRET, {expiresIn: "7d"})
        res.cookie('authorization', token, { httpOnly: true, sameSite: 'Strict'})
      }

      //if everything is ok we assign what we need to req and go back to the route
      req.userid = user.userid
      return next()
    })
  }
}

//if anything happens we get rid of the cookie and send a 401 status code
function no_auth(req, res, next) {
  res.clearCookie('authorization')
  return res.status(401).json({"error": "authorization not found"})
}
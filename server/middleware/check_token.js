import dotenv from 'dotenv'

import { V3 } from 'paseto'
import { client } from '../server_connection.js'

dotenv.config()


export default function() {
  return async function (req, res, next) {
    try {
      //get the headers and cookies (MUST EXIST)
      let token = req.cookies['authorization']
      let csrf = req.headers['csrf-token']
      let assigned_server = req.cookies['assigned_server']

      //if ANY are missing we return no_auth
      if(!assigned_server || !token || !csrf) return no_auth(req, res, next)

      //check if token and meta_data is valid
      let data = await V3.decrypt(token, process.env.TOKEN_SECRET)

      //check if he user.csrf is the same as the csrf header
      if(data.csrf != csrf) return no_auth(req, res, next)

      //check if the assigned server is the same as the one in the token (if not then we log the user out)
      if(assigned_server != assigned_server) return no_auth(req, res, next)

      //check if 1 hour has passed since the token was issued
      if(data.ts + (60*60) < (Date.now() / 1000)) {

        //check if refreshid was changed (change when compromised)
        let refreshid = await client.hget(`userid:${data.userid}`, "refreshid")
        if(refreshid != data.refreshid) return no_auth(req, res, next)

        //assign a fresh new authorization token
        let new_token = await V3.encrypt({"userid": data.userid, "refreshid": refreshid, "csrf": csrf, "ts": data.ts}, process.env.TOKEN_SECRET, {expiresIn: "7d"})
        res.cookie('authorization', new_token, { httpOnly: true, sameSite: 'Strict'})
      }

      //if everything is ok we assign what we need to req and go back to the route
      req.userid = data.userid
      return next()
    }
    catch(err) {
      return no_auth(req, res, next)
    }
  }
}

//if anything happens we get rid of the cookie and send a 401 status code
function no_auth(req, res, next) {
  res.clearCookie('authorization')
  return res.status(401).json({"error": "authorization is invalid"})
}
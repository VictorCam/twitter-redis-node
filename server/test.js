
//import redis
var Redis = require('ioredis')
const Joi = require('joi')
require("dotenv").config()
//connect
const client = new Redis({port: 6666})

client.on('connect', function() { console.log('TEST CLIENT: [Connected]') })

let ts = async () => {

    //testing ground
    //zcard
    let zcard = await client.zcard("following:1")
    console.log("zcard: ", zcard)
}


ts()
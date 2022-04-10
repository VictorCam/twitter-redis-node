
//import redis
var Redis = require('ioredis')
const Joi = require('joi')
require("dotenv").config()
//connect
const client = new Redis({port: 6666})

client.on('connect', function() { console.log('TEST CLIENT: [Connected]') })

let ts = async () => {

    //testing ground
}


ts()
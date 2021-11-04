const Redis = require("ioredis")
const { Redisearch, RedisGraph } = require('redis-modules-sdk')
require("dotenv").config()

// const sclient = new Redisearch({port: 6379})
// const client = new Redis({port: 6666, enableAutoPipelining: false})
// const pub = new Redis({port:6666})
// const sub = new Redis({port:6666})
let client = new Redis(process.env.UPSTASH)


client.on('connect', function() { console.log('REDIS: [Connected]') })

module.exports = {client}
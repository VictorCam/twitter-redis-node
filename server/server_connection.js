const Redis = require("ioredis")
// const { Redisearch, RedisGraph } = require('redis-modules-sdk')
require("dotenv").config()

// const client = new Redisearch({port: 6379})
const client = new Redis({port: 6666})
// const client = new Redis(process.env.REDIS_URL)
// const pub = new Redis({port:6666})
// const sub = new Redis({port:6666})

client.on('connect', function() { console.log('CLIENT: [Connected]') })

module.exports = {client}
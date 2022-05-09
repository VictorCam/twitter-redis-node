/*
 * Author: GitHub @VictorCam
 */

import redis from 'ioredis'
import dotenv from 'dotenv'
// const { Redisearch, RedisGraph } = require('redis-modules-sdk')
dotenv.config()

// const client = new Redisearch({port: 6379})
const client = new redis({port: 6666})
// const client = new Redis(process.env.REDIS_URL)
const lclient = new redis(process.env.REDIS_URL, {enableOfflineQueue: false}) 
// const pub = new Redis({port:6666})
// const sub = new Redis({port:6666})

redis.Command.setReplyTransformer("hgetall", (result) => {
    if(result.length != 0) {
        const obj = {}
        for (let i = 0; i < result.length; i+=2) {
            obj[result[i]] = result[i + 1]
        }
        return obj
    }
    return null
})

if(process.env.NODE_ENV == "development") {
    client.on('connect', function() { console.log('CLIENT: [Connected]') })
    lclient.on('connect', function() { console.log('LCLIENT: [Connected]') })
}

export {client, lclient}
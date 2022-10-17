import redis from 'ioredis'
import dotenv from 'dotenv'
import { StreamIORedis } from './node_modules/@jamify/redis-streams'

dotenv.config()

// const client = new Redisearch({port: 6379})
// const client = new redis({port: 6666})
const client = new redis(process.env.REDIS_URL)
const lclient = new redis(process.env.REDIS_URL, {enableOfflineQueue: false}) 
let imgClient = new StreamIORedis(process.env.REDIS_URL)

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
    client.on('connect', () => { console.log('CLIENT: [Connected]') })
    lclient.on('connect', () => { console.log('LCLIENT: [Connected]') })
    imgClient.on('connect', () => { console.log('imgClient: [Connected]') })
}

export {client, lclient, imgClient}

//import redis
var Redis = require('ioredis');

//connect
const client = new Redis({port: 6666})

client.on('connect', function() { console.log('TEST CLIENT: [Connected]') })

//client zadd

let ts = async () => {
// let res = await client.zadd('following:1', 3, 'OROBUX')
// console.log(res)

//zrem
let res = await client.zrem('following:1', 'OROBUX')
console.log(res)
}


ts()
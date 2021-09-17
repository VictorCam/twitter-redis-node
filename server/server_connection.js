const Redis = require("ioredis")
const { Redisearch, RedisGraph } = require('redis-modules-sdk')

const sclient = new Redisearch({port: 6379})
const gclient = new RedisGraph({port:6379})
const rclient = new Redis({port: 6379})
const client = new Redis({port: 6666})
const pub = new Redis({port:6666})
const sub = new Redis({port:6666})

client.on('connect', function() { console.log('KVROCKS: [Connected]') })
rclient.on('connect', function() { console.log('REDIS: [Connected]') })

// async function create_index(index, schema, param) {
//     try {
//         await sclient.connect();
//         const response = await sclient.create(index, 'HASH', schema, param)
//         console.log(response)
//         await sclient.disconnect();
//     }
//     catch(e) {
//         console.log("error in create_index", e)
//     }
// }

// //login only
// //suser: userid, username, email
// create_index("suser", [{name: "username", type: "TAG"}, {name: "email", type: "TAG"}], {prefix: {num: 1, prefixes: ["suser:"]}})
// create_index("spost", [{name: "username", type: "TAG"}, {name: "tag", type: "TAG"}, {name: "SCORE", type: "NUMERIC"}], {prefix: {num: 1, prefixes: ["spost:"]}})


//note to self
//https://stackoverflow.com/questions/53832663/how-to-write-a-query-to-both-include-and-exclude-tags-in-redisearch#comment94525695_53833329
// async function search(index) {
//     try {
//         await sclient.connect()
//         const results = await sclient.search(index, `@cs101:{hello} @score:[12, 12]`)
//         await sclient.disconnect()
//         console.log("test", results)
//     }
//     catch(e) {
//         console.log('error in search function')
//     }
//   }
// search("new_idx")


//use this for comment/like/retweet/follower+following/mentions
// async function create_graph() {
//     try {
//         await gclient.connect()
//         const result = await gclient.query("test", `CREATE (:Rider {name:'Daneil'})-[:rides]->(:Team {name:'Yamaha', size:32}), (:Rider {name:'Dani Pedrosa'})-[:rides]->(:Team {name:'Honda'}), (:Rider {name:'Andrea Dovizioso'})-[:rides]->(:Team {name:'Ducati'})`)
//         console.log(result)
//         const result2 = await gclient.readonlyQuery("test", `MATCH (r:Rider)-[:rides]->(t:Team) WHERE t.name = 'Yamaha' RETURN r,t`)
//         // console.log(result2[1][0][0][2])
//         console.log(result2[1][0][1][2][1][0][1])
//         await gclient.disconnect()
//     }
//     catch (e) {
//         console.log("error", e)
//     }
// }
// create_graph()


//note replace [exists O(n)] with [get O(1)] smh
// async function test() {
//     console.log(await client.get("test1"))
// }
// test()



module.exports = {client, pub, sub, sclient, rclient, gclient};
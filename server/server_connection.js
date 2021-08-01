const cassandra = require('cassandra-driver')
const Redis = require("ioredis")
require('colors')

const red = new Redis({
  port: 6379,
  host: "localhost",
  family: 4,
  db: 0,
})

const cql = new cassandra.Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1'
})

cql.connect(function(err) {
  if(err) console.log(err)
  console.log("cass_status:", "ready".black.bgGreen)
  console.log("redis_status:", red.status.black.bgGreen)
})

red.set("foo", "bar")

module.exports = {cql, red};
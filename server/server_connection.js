const Aerospike = require('aerospike')

const aql = new Aerospike.Client({
    hosts: 'localhost:3000'
})

aql.connect((error) => { 
    if (error) throw error
    else console.log("connected to aerospike")
})

const key = new Aerospike.Key('test', 'demo', 'demo')

// console.log("testing123")// module.exports = {aql};
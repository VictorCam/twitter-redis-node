const Aerospike = require('aerospike')
const ops = Aerospike.operations
const lists = Aerospike.lists
const maps = Aerospike.maps
const key = Aerospike.Key


const aql = new Aerospike.Client({
    hosts: 'localhost:3000'
})


//note to self: add add one liner error handling?
async function test() {
    try {
    var client = await Aerospike.connect()

    var pk = null
    var ck = null
    var bins = null
    var data = null
    var policy = null
    var meta = null

    ck = new Aerospike.Key('test', 'testset', 'k9')
    // record = {a: 'a'}
    // policy = { exists: Aerospike.policy.exists.CREATE_OR_REPLACE }
    // meta = { ttl: 1 }
    // await client.put(ck, record, meta, policy)


    await client.remove(ck)

    // //create a column name and age with these values
    // pk = "k9"
    // ck = new Aerospike.Key('test', 'testset', pk)
    // bins = { pk: pk, name: "Bob", age: 31 }
    // await client.put(ck, bins)
    // data = await client.get(ck)
    // console.log('data:', data.bins)

    // //preform multiple operations with ops[]
    // pk = "k2"
    // let ops = [ maps.putItems('map2', { d: 4, b: 2, c: 3 }) ]
    // bins = { pk: pk }
    // key = new Aerospike.Key('test', 'testset', pk)
    // await client.operate(key, ops)
    // await client.put(key, bins)
    // let data2 = await client.get(key)
    // console.log("data2:", data2.bins.map2)

    // //select specific bins
    // bins = ['name', 'map']
    // data = await client.select(key, bins)
    // console.log("data3:", data.bins)

    // //specify specific keys
    // let readKeys = [
    //     { key: new Aerospike.Key('test', 'testset', 'k9'), read_all_bins: true },
    //     { key: new Aerospike.Key('test', 'testset', 'k2'), read_all_bins: true }
    // ]
    // let testing = await client.batchRead(readKeys)
    // testing.forEach(function (result, i) {
    //     console.log(`batch ${i}:`, result.record.bins)
    // })

    // // //does not exist
    // // pk = 'kk'
    // // bins = ['as_bin']
    // // data = await client.select(key, bins)
    // // console.log("data4:", data.bins)

    // //set ttl
    // var key = new Aerospike.Key('test', 'testset', pk)
    // var rec = { as_bin: 'bin-content' }
    // await client.put(key, rec, { ttl: 100 }, { key: Aerospike.policy.key.SEND })




    client.close()

    }
    catch(e) {
        client.close()
        console.log("error with an api call", e)
    }
}
test()



module.exports = {aql};
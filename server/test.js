import redis from 'ioredis'

import fs from 'fs'
// import { PassThrough, Duplex } from 'node:stream'

var client = redis.createClient({port: 6666});




const fun = async () => {

    // var stream = new RedisStreamRange(
    //     redis.createClient({port: 6666}),
    //     'data2',
    //     {
    //         chunkSize: 10,
    //         delimiter: "\n",
    //         autoClose: true
    //     }
    // )

    // let file = fs.readFileSync("./fox.webm")
    // console.log(file)

    // file.pipe(stream)


    //use getrangeBuffer to grab a certain length then pipe it to the result

//https://www.gbmb.org/bytes-to-mb

    //we start with 
    let incr = 1000000 * 2
    let start = 0
    let end = incr
    let count = 0
    while(true) {
        console.log(`roundtrip:${count}`)
        console.log(`start:${start} end:${end}`)
        let res = await client.buffer

        if(res === null) break
        console.log(res)
        start += incr
        end += incr
        count++
    }

    console.log("done!")


    //the last number indicates the number of mb you want in memory

    //put the result into a writable stream
    // let stream = fs.createWriteStream(res)


    




    // stream.on('data', function(chunk) {
    //     console.log(chunk);
    // })

    // stream.on('end', function(length) {
    //     console.log('length: ', length);
    // })



    // const duplex = new Duplex({
    //     write: (chunk, encoding, next) => {
    //         console.log('write', chunk.toString())
    //         next()
    //     },
    //     read: (size) => {
    //         this.push("some data")
    //     }
    // })
}

console.time('test')
fun()
console.timeEnd('test')
import { readFile } from 'fs/promises'
// import { compress, uncompress } from 'lz4-napi'
import redis from 'ioredis'
// import lz4 from 'lz4-wasm'
import snappy from 'snappy'

//connect to port 6666 for ioredis
// const client = new Redis({port: 6666})
const client = new redis()

//check if 


// if you support top-level await
const fun = async () => {
    // console.log("test")

    console.time("fox")
    const buffer = await readFile("./fox.mp4")
    const compressedBuffer = await snappy.compress(buffer)
    console.timeEnd("fox")

    console.time("set")
    await client.setBuffer("fox", compressedBuffer)
    console.timeEnd("set")


    console.time("get")
    const decompressedBuffer = await client.getBuffer('fox')
    const final = await snappy.uncompress(decompressedBuffer)
    console.timeEnd("get")

    // console.log(buffer.length == final.length)

}

fun()

// Store compressed buffer somewhere
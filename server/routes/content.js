import express from 'express'
import dotenv from 'dotenv'
import joi from 'joi'
import base62 from 'base62/lib/ascii.js'
import check_token from '../middleware/check_token.js'
import tc from '../middleware/try_catch.js'
import busboy from 'busboy'

import { client } from '../server_connection.js'
import { nanoid } from 'nanoid'
import { v_username, v_email, v_password } from '../middleware/validation.js'
import fs from 'fs'
const router = express.Router()
dotenv.config()

router.get("/content/:image", tc(async (req, res) => {


    let pipe = client.pipeline()
    pipe.hgetall(`meta:${req.params.image}`)
    pipe.hlen(`content:${req.params.image}`)
    let [[,meta], [,len]] = await pipe.exec()

    if(!meta) return res.status(404).json({"error": "not found"})


    let rangeh = req.headers.range

    if(rangeh) {
        let [rstart, rend] = rangeh.replace(/bytes=/, "").split("-")
        rstart = parseInt(rstart, 10)
        rend = rend ? parseInt(rstart, 10) : meta.bytes - 1

        res.writeHead(206, {
            "Content-Range": `bytes ${rstart}-${rend}/${meta.bytes}`,
            "Accept-Ranges": "bytes",
            "Content-Length": (rend - rstart) + 1,
            'Content-Type': meta.contentType
        })
    }
    else {
        res.writeHead(200, {
            'Content-Type': meta.contentType,
            'Content-Length': meta.bytes,
        })
    }

    // let start = 0
    // let end = size
    // console.log("hlen", [1,,3])

    // let data = await client.zrangeBuffer(`content:${req.params.image}`, 0, -1)

    function range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx)
    }
    let rng = range(1, 1378)

    let stream = await client.hmgetBuffer(`content:${req.params.image}`, rng)

    for(let i = 0; i < stream.length; i++) {
        if(stream[i].length == 0) return res.end()
        res.write(stream[i])
    }

    return res.end()
}))


//issue might have to be with uploading



router.post('/upload', tc(async (req, res) => {

    let bb = busboy({ headers: req.headers })

    bb.on('file', async (field, file, filename, encoding, mimetype) => {
        //generate a uniqueid for the image
        let contentid = base62.encode(Date.now()) + nanoid(parseInt(process.env.NANOID_LEN))
        
        // await client.set(`content:${contentid}`)
        let i = 0
        let bytes = 0

        file.on('data', async (data) => {
            i++
            bytes += data.length
            await client.hset(`content:${contentid}`, i, data)
        })
      
        file.on('end', async () => {
            console.log(field, file, filename)
            await client.hset(`meta:${contentid}`, ['encoding', filename['encoding'], 'contentType', filename['mimeType'], 'bytes', bytes])
            res.status(200).send({"contentid": contentid})
        })
    })
    req.pipe(bb)
}))



export default router
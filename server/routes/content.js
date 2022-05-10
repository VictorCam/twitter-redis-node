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

const router = express.Router()
dotenv.config()

router.get("/content/:image", tc(async (req, res) => {

    let pipe = client.pipeline()
    pipe.getBuffer(`content:${req.params.image}`)
    pipe.hgetall(`meta:${req.params.image}`)
    let [[,buff], [,meta]] = await pipe.exec()

    if(!meta || !buff) return res.status(404).json({"error": "not found"})
 
    res.set('Content-Type', meta.contentType)
    
    return res.send(buff)
}))

router.post('/upload', tc(async (req, res) => {

    var bb = busboy({ headers: req.headers })
    req.pipe(bb)

    bb.on('file', function(field, file, filename, encoding, mimetype) {
        const temp = {file: []}

        file.on('data', (data) => { temp.file.push(data) })
      
        file.on('end', async () => {
            temp.file = Buffer.concat(temp.file)
            temp.filename = filename
            temp.contentType = mimetype

            //generate a uniqueid for the image
            let contentid = base62.encode(Date.now()) + nanoid(parseInt(process.env.NANOID_LEN))
            let name = `${filename['filename']}_${contentid}`

            //store in redis
            let pipe = client.pipeline()
            pipe.setBuffer(`content:${name}`, temp.file)
            pipe.hset(`meta:${name}`, ['encoding', filename['encoding'], 'contentType', filename['mimeType']])
            pipe.exec()
            res.status(200).send({"contentid": name})
        })
    })
}))



export default router
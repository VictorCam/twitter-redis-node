import express from 'express'
import dotenv from 'dotenv'
import joi from 'joi'
import base62 from 'base62/lib/ascii.js'
import check_token from '../middleware/check_token.js'
import tc from '../middleware/try_catch.js'
import busboy from 'busboy'

import { client, imgclient } from '../server_connection.js'
import { nanoid } from 'nanoid'
import { v_username, v_email, v_password } from '../middleware/validation.js'
import fs from 'fs'
const router = express.Router()
dotenv.config()

import sharp from 'sharp'

//https://images.weserv.nl/docs/ (consider as a caching layer to prevent server overloading)

//https://images.weserv.nl/?url=https://raw.githubusercontent.com/link-u/avif-sample-images/master/fox.profile2.10bpc.yuv422.odd-height.avif&output=png
//something like this is rly good!!



//pipe content in avif format (use images.weserv.nl to cache endpoint)
router.get("/content/", tc(async (req, res) => {

    console.log("i hit the endpoint")

    res.setHeader('content-type', 'image/avif')
    
    imgclient.readStream('testing345')
    .pipe(res)
    .on('finish', () => res.end())
}))


//issue might have to be with uploading



router.post('/upload', tc(async (req, res) => {


    // fs.createReadStream('./shep.png')
    // .pipe(sharp().avif())
    // .pipe(imgclient.writeStream('testing345'))
    // .on('finish', () => res.end())
    
    ///////////////
    

    // let bb = busboy({ headers: req.headers })

    // bb.on('file', async (field, file, filename, encoding, mimetype) => {
    //     //generate a uniqueid for the image
    //     let contentid = base62.encode(Date.now()) + nanoid(parseInt(process.env.NANOID_LEN))
        
    //     // await client.set(`content:${contentid}`)
    //     let i = 0
    //     let bytes = 0

    //     file.on('')

    //     file.on('data', async (data) => {
    //         i++
    //         bytes += data.length
    //         await client.hset(`content:${contentid}`, i, data)
    //     })
      
    //     file.on('end', async () => {
    //         // console.log(field, file, filename)
    //         await client.hset(`meta:${contentid}`, ['encoding', filename['encoding'], 'contentType', filename['mimeType'], 'bytes', bytes])
    //         res.status(200).send({"contentid": contentid})
    //     })
    // })
    // req.pipe(bb)
}))



export default router
import express from 'express'
import dotenv from 'dotenv'
import joi from 'joi'
import base62 from 'base62/lib/ascii.js'
import check_token from '../middleware/check_token.js'
import tc from '../middleware/try_catch.js'
import busboy from 'busboy'
import sharp from 'sharp'

import { client, imgClient } from '../server_connection.js'
import { nanoid } from 'nanoid'
import { v_username, v_email, v_password, v_imageid } from '../middleware/validation.js'
const router = express.Router()
dotenv.config()

//https://images.weserv.nl/docs/ (consider as a caching layer to prevent server overloading)

//https://images.weserv.nl/?url=https://raw.githubusercontent.com/link-u/avif-sample-images/master/fox.profile2.10bpc.yuv422.odd-height.avif&output=png
//something like this is rly good!!

//test for other stuff

//pipe content in avif format (use images.weserv.nl to cache endpoint)
router.get("/image/:imageid", tc(async (req, res) => {

    //(seaweedfs) check if the user has permission here to view the image

    //validate object
    let schema = joi.object().keys({ 
        "imageid": v_imageid.required(), 
    })
    let valid = schema.validate(req.params)
    if(valid.error) {
        if(valid.error.details[0].type != 'object.unknown') return res.status(400).json({"error": valid.error.details[0].context.label})
        return res.status(400).json({"error": "invalid user input"})
    }

    //check if the key exists else display image that tells the user the image does not exist

    res.setHeader('content-type', 'image/avif')
    
    imgClient.readStream(`image:${req.params.imageid}`)
    .pipe(res)
    .on('finish', () => res.end())
}))

//issue might have to be with uploading


//test for filetype etc
//can we stream the progress?

router.post('/image', tc(async (req, res) => {

    let bb = busboy({ headers: req.headers })

    let imageid = base62.encode(Date.now()) + nanoid(parseInt(process.env.NANOID_LEN))
      
    bb.on('file', async (field, file, filename, encoding, mimetype) => {
        //check if it's something valid for sharp to use

        file.pipe(sharp().avif({effort: 2, quality: 50})).pipe(imgClient.writeStream(`image:${imageid}`))
        .on('finish', async () => await res.status(200).json({"imageid": imageid}))


    })
    req.pipe(bb)
}))



export default router
import express from 'express'
import dotenv from 'dotenv'
import joi from 'joi'
import snappy from 'snappy'
import base62 from 'base62/lib/ascii.js'
import check_token from '../middleware/check_token.js'
import tc from '../middleware/try_catch.js'

import { client } from '../server_connection.js'
import { V3 } from 'paseto'
import { nanoid } from 'nanoid'
import { v_username, v_email, v_password } from '../middleware/validation.js'


import formidable from 'formidable'

const router = express.Router()
dotenv.config()

router.post("/content", tc(async (req, res) => {

    //use formidable v3
    const form = formidable({})

    //parse the form
    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).json({"error": "error parsing form"})
        console.log(fields)
    })



    //parse the form
    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).json({"error": err})
        console.log(files)
    })



    //get the multipart/form-data from the request
    console.log(req.files)


    return res.status(200).json({"test": "res"})
}))



export default router
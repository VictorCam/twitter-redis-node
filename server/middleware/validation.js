//import joi
const Joi = require('joi')
const dayjs = require('dayjs')
require("dotenv").config()
const base62 = require("base62/lib/ascii")

let length = base62.encode(dayjs().valueOf()).length + parseInt(process.env.NANOID_LEN) //this values will change when the unix gets too large

//userid
let userid = Joi.string().pattern(new RegExp(`^[a-zA-Z0-9-_]{${11},${length}}$`)).label("invalid userid format")

//account.js
let username = Joi.string().regex(/^[a-zA-Z0-9_]{1,20}$/).lowercase().label("username must be between 1-20 characters and can only contain letters, numbers and underscores")
let email = Joi.string().email().min(5).max(200).lowercase().label("email must be between 5-200 characters and must be a valid email")
let password = Joi.string().regex(/^[\x21-\x7E]{8,200}$/).label("password must be between 8-200 characters and only contain letters, numbers, and special characters")

//comment.js 
let ncommentid = Joi.string().pattern(new RegExp(`^[a-zA-Z0-9-_]{${11},${length}}$`)).label("invalid ncommentid format")
let commentid = Joi.string().pattern(new RegExp(`^[a-zA-Z0-9-_]{${11},${length}}$`)).label("invalid commentid format")
let postid = Joi.string().pattern(new RegExp(`^[a-zA-Z0-9-_]{${11},${length}}$`)).label("invalid postid format")
let comment = Joi.string().min(1).max(1000).label("comment should be between 1 to 1000 characters")
let type = Joi.string().valid("like", "reg").label("invalid type (like/reg) allowed")

module.exports = { 
    username, 
    email, 
    password, 
    ncommentid, 
    commentid, 
    comment, 
    postid, 
    type,
    userid
}
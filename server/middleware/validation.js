//import joi
const Joi = require('joi')
require("dotenv").config()
const base62 = require("base62/lib/ascii")

let v_length = base62.encode(Date.now()).length + parseInt(process.env.NANOID_LEN) //this values will change when the unix gets too large

//userid
let v_userid = Joi.string().pattern(new RegExp(`^[a-zA-Z0-9-_]{${11},${v_length}}$`)).label("invalid userid format")

//account.js
let v_username = Joi.string().regex(/^[a-zA-Z0-9_]{1,20}$/).lowercase().label("username must be between 1-20 characters and can only contain letters, numbers and underscores")
let v_email = Joi.string().email().min(5).max(200).lowercase().label("email must be between 5-200 characters and must be a valid email")
let v_password = Joi.string().regex(/^[\x21-\x7E]{8,200}$/).label("password must be between 8-200 characters and only contain letters, numbers, and special characters")

//comment.js posts.js
let v_ncommentid = Joi.string().pattern(new RegExp(`^[a-zA-Z0-9-_]{${11},${v_length}}$`)).label("invalid ncommentid format")
let v_commentid = Joi.string().pattern(new RegExp(`^[a-zA-Z0-9-_]{${11},${v_length}}$`)).label("invalid commentid format")
let v_postid = Joi.string().pattern(new RegExp(`^[a-zA-Z0-9-_]{${11},${v_length}}$`)).label("invalid postid format")
let v_comment = Joi.string().min(1).max(1000).label("comment should be between 1 to 1000 characters")
let v_type = Joi.string().valid("like", "reg").label("invalid type (like/reg) allowed")

//post.js
let v_image = Joi.string().min(1).max(100).label("image must be between 1 and 100 characters")
let v_name = Joi.string().min(1).max(100).label("name must be between 1 and 100 characters")
let v_tags = Joi.string().min(1).max(3000).label("tags must be between 1 and 3000 characters")
let v_desc = Joi.string().min(0).max(5000).label("desc must be between 0 and 5000 characters")
let v_can_comment = Joi.number().integer().min(0).max(1).label("can_comment must be a 1 or 0")
let v_can_comment_img = Joi.number().integer().min(0).max(1).label("can_comment_img must be a 1 or 0")
let v_can_comment_sticker = Joi.number().integer().min(0).max(1).label("can_comment_sticker must be a 1 or 0")
let v_can_like = Joi.number().integer().min(0).max(1).label("can_like must be a 1 or 0")
let v_can_rehowl = Joi.number().integer().min(0).max(1).label("can_rehowl must be a 1 or 0")

module.exports = { 
    v_username, 
    v_email, 
    v_password, 
    v_ncommentid, 
    v_commentid, 
    v_comment, 
    v_postid, 
    v_type,
    v_userid,
    v_image,
    v_name,
    v_tags,
    v_desc,
    v_can_comment,
    v_can_comment_img,
    v_can_comment_sticker,
    v_can_like,
    v_can_rehowl
}
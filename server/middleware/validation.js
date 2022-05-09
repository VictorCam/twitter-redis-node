import joi from 'joi'
import dotenv from 'dotenv'
import base62 from 'base62/lib/ascii.js'

dotenv.config()

let v_length = base62.encode(Date.now()).length + parseInt(process.env.NANOID_LEN) //this values will change when the unix gets too large

//userid
let v_userid = joi.string().pattern(new RegExp(`^[a-zA-Z0-9-_]{${11},${v_length}}$`)).label("invalid userid format")

//account.js
let v_username = joi.string().regex(/^[a-zA-Z0-9_]{1,20}$/).lowercase().label("username must be between 1-20 characters and can only contain letters, numbers and underscores")
let v_email = joi.string().email().min(5).max(200).lowercase().label("email must be between 5-200 characters and must be a valid email")
let v_password = joi.string().regex(/^[\x21-\x7E]{8,200}$/).label("password must be between 8-200 characters and only contain letters, numbers, and special characters")

//comment.js posts.js
let v_ncommentid = joi.string().pattern(new RegExp(`^[a-zA-Z0-9-_]{${11},${v_length}}$`)).label("invalid ncommentid format")
let v_commentid = joi.string().pattern(new RegExp(`^[a-zA-Z0-9-_]{${11},${v_length}}$`)).label("invalid commentid format")
let v_postid = joi.string().pattern(new RegExp(`^[a-zA-Z0-9-_]{${11},${v_length}}$`)).label("invalid postid format")
let v_comment = joi.string().min(1).max(1000).label("comment should be between 1 to 1000 characters")
let v_type = joi.string().valid("like", "reg").label("invalid type (like/reg) allowed")

//post.js
let v_image = joi.string().min(1).max(100).label("image must be between 1-100 characters")
let v_name = joi.string().min(1).max(100).label("name must be between 1-100 characters")
let v_tags = joi.string().min(1).max(3000).label("tags must be between 1-3000 characters")
let v_desc = joi.string().min(0).max(5000).label("desc must be between 0-5000 characters")
let v_can_comment = joi.number().integer().min(0).max(1).label("can_comment must be a 1 or 0")
let v_can_comment_img = joi.number().integer().min(0).max(1).label("can_comment_img must be a 1 or 0")
let v_can_comment_sticker = joi.number().integer().min(0).max(1).label("can_comment_sticker must be a 1 or 0")
let v_can_like = joi.number().integer().min(0).max(1).label("can_like must be a 1 or 0")
let v_can_rehowl = joi.number().integer().min(0).max(1).label("can_rehowl must be a 1 or 0")

//feed.js
let v_range = joi.number().integer().invalid(0).min(-50).max(50).label("range must be an integer between -50 and 50")

export { 
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
    v_can_rehowl,
    v_range
}
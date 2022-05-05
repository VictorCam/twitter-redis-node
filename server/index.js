const express = require("express")
const cookieParser = require('cookie-parser')
const cors = require("cors")
const helmet = require("helmet")
const app = express()
require("dotenv").config()
const { client, lclient } = require("./server_connection")
const { RateLimiterRedis } = require('rate-limiter-flexible')

//cors details
const corsOptions = {
  origin: process.env.CLIENT_API, 
  credentials: true
}

//file details
const fileOptions = {
  dotfiles: "ignore",
  etag: true,
  extensions: ["png", "jpg", "jpeg"],
  index: false,
  redirect: false
}

//rate limiter details
const limiter = new RateLimiterRedis({
  redis: lclient, // connection
  keyPrefix: 'ratelimit', // name of the key in redis
  points: parseInt(process.env.MAX_REQUESTS), // 2500 = 25 requests per 1 minutes
  duration: 60 * 60 // 1 hour
})

//disable x-powered-by header
app.disable('x-powered-by')

//rate limiter middleware before we do any processing
app.use(async ( req, res, next) => {
  let ip = req.ip.replace(/:/g, "|")
  limiter.consume(ip).then((info) => { 
    res.set({
      "Retry-After": parseInt(info.msBeforeNext / 1000),
      "X-RateLimit-Limit": process.env.MAX_REQUESTS,
      "X-RateLimit-Remaining": info.remainingPoints,
    })
    return next() 
  })
  .catch((info) => { 
    res.set({
      "Retry-After": parseInt(info.msBeforeNext / 1000),
      "X-RateLimit-Limit": process.env.MAX_REQUESTS,
      "X-RateLimit-Remaining": info.remainingPoints,
    })
    return res.status(429).json({"error": "too many requests"}) 
  })
})

//middlewares for cors/helmet/cookie-parser/image-upload/and memory limits
app.use(cors(corsOptions))
app.use(helmet())
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET))
app.use("/image", express.static('uploads', fileOptions)) //use a reverse proxy (nginx) for improved preformance
app.use(express.urlencoded({ extended: true, limit: "1kb", parameterLimit: 10 }))
app.use(express.json({ limit: "3kb", 'type': 'application/json'}))

//error handling before going to the routes
app.use((error, req, res, next) => {
  if(error.type == "entity.parse.failed") return res.status(400).json({ "error": "error parsing json" })
  if(error.type == "entity.too.large") return res.status(413).json({ "error": "request entity too large" })
  if(error !== null) return res.sendStatus(500)
  return next()
})

//imported routes
const login = require("./routes/account")
const posts = require("./routes/posts")
const comment = require("./routes/comment")
const follow = require("./routes/follow")
const feed = require("./routes/feed")

//linked routes
app.use("/v1", [login, posts, comment, follow, feed])

//try catch err handle for all routes when they fail
app.use((error, req, res, next) => {
  if(process.env.NODE_ENV == 'production') client.zadd("errors", Date.now(), JSON.stringify(error))
  if(process.env.NODE_ENV == 'development') console.log(`error in %s route ==`, req.url, error)
  return res.sendStatus(500)
})

// create a test / route
app.get("/", (req, res) => {
  return res.status(200).json({"message": "hello world"})
})

//port
const PORT = process.env.PORT || 13377
app.listen(PORT, function() {
  if(process.env.NODE_ENV == "development") console.log("Server is running on port:", PORT)
})
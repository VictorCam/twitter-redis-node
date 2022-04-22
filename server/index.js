const express = require("express")
const cookieParser = require('cookie-parser')
const cors = require("cors")
const helmet = require("helmet")
const app = express()
require("dotenv").config()

const corsOptions = { origin: process.env.CLIENT_API, credentials: true }

const fileOptions = {
  dotfiles: "ignore",
  etag: true,
  extensions: ["png", "jpg", "jpeg"],
  index: false,
  redirect: false
}

app.use(cors(corsOptions))
app.use(helmet())
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET))
app.use("/image", express.static('uploads', fileOptions)) //use a reverse proxy (nginx) for improved preformance
app.use(express.urlencoded({ extended: true, limit: "2kb" })) //make sure to limit this in the future (not sure how the limit work for this)
app.use(express.json({ limit: "2kb"}))

//error handling before going to the routes
app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") return res.status(400).json({ "error": "error parsing json" })
  if (error.type === "entity.too.large") return res.status(413).json({ "error": "request entity too large" })
  if (error !== null) return res.sendStatus(500)
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

//try catch error handling for all routes when they unexpectly fail 
app.use((error, req, res, next) => {
  console.log(`error in ${req.url} route ==`, error)
  return res.sendStatus(500)
})

// create a / route
app.get("/", (req, res) => {
  return res.send("hello world")
})

//port
const PORT = process.env.PORT || 13377
app.listen(PORT, function() {
  console.log("Server is running on port:", PORT)
})
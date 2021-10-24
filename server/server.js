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
app.use(express.urlencoded({ extended: true })) //make sure to limit this in the future (not sure how the limit work for this)
app.use(express.json({ limit: "2kb"}))

app.use((error, req, res, next) => {
  console.log(error)
  if (error.type == "entity.parse.failed") return res.status(400).json({ "error": "error parsing json" })
  if (error.type == "entity.too.large") return res.status(413).json({ "error": "request entity too large" })
  if (error !== null) return res.status(500).json({ "error": "internal server error" })
  return next()
})

//imported routes
const users = require("./routes/route_users")
const login = require("./routes/route_account")
const posts = require("./routes/route_posts")
const comment = require("./routes/route_comment")
const draw = require("./routes/route_draw")

//linked routes (route middleware)
app.use("/", [users, login, posts, comment, draw])


//port
const PORT = process.env.PORT || 13377
app.listen(PORT, function() {
  console.log("Server is running on port:", PORT)
})
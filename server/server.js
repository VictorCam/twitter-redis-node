const express = require("express")
const cookieParser = require('cookie-parser')
const cors = require("cors")
const app = express()
require("dotenv").config()

const corsOptions = { origin: 'http://localhost:8080', credentials: true }

const fileOptions = { 
  dotfiles: "ignore",
  etag: true,
  extensions: ["png", "jpg", "jpeg"],
  index: false,
  redirect: false
}

app.use(cors(corsOptions))
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET))
app.use("/image", express.static('uploads', fileOptions)) //use a reverse proxy (nginx) for improved preformance
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((error, req, res, next) => {
  if (error !== null)  return res.json({ error: "json is malformed" })
  return next()
})

//imported routes
const
  users = require('./routes/route_users'),
  login = require('./routes/route_account'),
  posts = require("./routes/route_posts")

//linked routes (route middleware)
app.use("/", [users, login, posts])


//port
const PORT = process.env.PORT || 13377
app.listen(PORT, function() {
  console.log("Server is running on port:", PORT)
})
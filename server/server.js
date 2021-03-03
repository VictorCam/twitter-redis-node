const express = require("express")
const cors = require("cors")
const app = express()

const corsOptions = { origin: 'http://localhost:8080', credentials: true }

const fileOptions = { 
  dotfiles: "ignore",
  etag: true,
  extensions: ["png", "jpg", "jpeg"],
  index: false,
  redirect: false
}

app.use(cors(corsOptions))
app.use("/image", express.static('uploads', fileOptions)) //use a reverse proxy (nginx) for improved preformance
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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
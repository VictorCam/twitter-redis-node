const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

//imported routes
const
  users = require('./routes/route_users')

//linked routes (route middleware)
app.use("/", [users])


//port
const PORT = process.env.PORT || 13377;
app.listen(PORT, function() {
  console.log("Server is running on port:", PORT)
})
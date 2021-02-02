const express = require("express")
const router = express.Router()
const cors = require("cors")
const connectsql = require("../server_connection")
const check_token = require("../middleware/check_token")

router.get("/", check_token, (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080')
  
  const sql = "SELECT * FROM user_tables";
  connectsql.query(sql, (err, data) => {
    if(!err) {
      res.status(200).send(data);
    }
    else {
      console.log(err);
      res.status(500).json("route error");
    }
  })
});

router.use(cors());

module.exports = router;

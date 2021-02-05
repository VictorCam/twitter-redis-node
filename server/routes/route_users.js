const express = require("express")
const router = express.Router()
const cors = require("cors")
const connectsql = require("../server_connection")
const check_token = require("../middleware/check_token")

router.get("/", check_token(), (req, res) => {
  const sql = "SELECT * FROM user_tables";
  connectsql.query(sql, (err, data) => {
    if(!err) {
      return res.status(200).send(data);
    }
    else {
      console.log(err);
      return res.status(500).json("route error");
    }
  })
})

router.use(cors());

module.exports = router;

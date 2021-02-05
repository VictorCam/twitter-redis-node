const express = require("express")
const router = express.Router()
const cors = require("cors")
const connectsql = require("../server_connection")
const check_token = require("../middleware/check_token")
  
router.get("/posts", check_token(), (req, res) => {
    var sql = "SELECT USER.ID, USER.Name, POST.POST_ID, POST.post FROM user_tables USER, user_post POST WHERE USER.ID = POST.ID"
    connectsql.query(sql, function (err, data) {
            if (!err) {
                return res.status(200).send(data)
            } else {
                return res.status(500).send("unable to load posts")
            }
    })
})

router.post("/create_post", check_token(), (req, res) => { //do not forever to check if the post belongs to the user with a WHERE ID = req.user_ID
    var sql = "INSERT INTO user_post(ID, Post) VALUES(?, ?)"
    connectsql.query(sql, [req.user_ID, req.body.info], function (err, data) {
            if (!err) {
                var reply = { //object must be consistent with the POST ID (server headers)
                    'POST_ID': data.insertId, 
                    'ID': req.user_ID,
                    'post': req.body.info
                }
                res.status(200).send(reply)
            } 
            else {
                res.status(500).send("unable to create post")
            }
        })
})

router.use(cors());

module.exports = router;

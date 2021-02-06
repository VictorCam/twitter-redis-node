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
    connectsql.query(sql, [req.id, req.body[0]], function (err, data) {
            if (!err) {
                const data = {}
                data.POST_ID = data.insertId
                data.ID = req.id
                data.post = req.body[0]
                return res.status(200).send(data)
            }
            else {
                return res.status(500).send("unable to create post")
            }
        })
})

router.post("/edit_post", check_token(), (req, res) => {
    res.setHeader("Access-Control-Allow-Origin","http://localhost:8080")
    res.setHeader("Access-Control-Allow-Credentials",true)

    var sql = "UPDATE user_post SET Post = (?) WHERE user_post.POST_ID = (?) AND user_post.ID = (?)"
    connectsql.query(sql, [req.body[0], req.body[1], req.id], function (err, data) {
            if (!err) {
                const data = {}
                data.post = req.body[0]
                data.index = req.body[2]
                return res.status(200).send(data)
            }
            else {
                res.status(500).send("unable to update post")
            }
        })
})

router.post("/delete_post", check_token(), (req, res) => {
    res.setHeader("Access-Control-Allow-Origin","http://localhost:8080")
    res.setHeader("Access-Control-Allow-Credentials",true)
    var sql = "DELETE FROM user_post WHERE user_post.POST_ID = (?)"
    connectsql.query(sql, [req.body[0]], function (err, data) {
            if (!err) {
                res.status(200).send(req.body[1].toString()) //index to delete
            } 
            else {
                res.status(500).send("unable to delete post")
            }
        })
})

router.use(cors());

module.exports = router;

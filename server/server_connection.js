const mysql = require('mysql')

const connectsql = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: '',
  database: "test"
});

connectsql.connect(function(err) {
  if(err) {
    console.log("error with database")
  }
  else {
  console.log("connected to database")
  }
});

module.exports = connectsql;
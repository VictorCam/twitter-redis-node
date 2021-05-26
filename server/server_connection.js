const mysql = require('mysql2')

const connectsql = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: 'mukit',
  database: "mysql"
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
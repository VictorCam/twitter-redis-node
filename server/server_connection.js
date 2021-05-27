const mysql = require('mysql2')

const connectsql = mysql.createConnection({
  host: "localhost",
  user: "root", //note there can be priv levels for users in phpmyadmin
  password: 'test',
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
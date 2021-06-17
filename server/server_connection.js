const mariadb = require('mariadb');

//give lowest privilage level when connecting to database
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_DB,
    connectionLimit: 5
})

asyncFunction()

async function asyncFunction() {
  try {
    var conn = await pool.getConnection();
    const [res] = await conn.query("SELECT Post FROM user_post WHERE Post = 'a'");
    // console.log("test", res);
  }
  catch (err) {
    console.log("ended conn on err", err)
  }

  if(conn) return conn.end()
}

module.exports = pool;
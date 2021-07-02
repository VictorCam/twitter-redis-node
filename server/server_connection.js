// const mariadb = require('mariadb');
const postgres = require('postgres')

const sql = postgres({
  host: "localhost",
  username: 'postgres',
  password: 'test',
  database: "postgres",
})

async function test() {
await sql`SELECT 1;`
}

test()

//give lowest privilage level when connecting to database
// const pool = mariadb.createPool({
//     port: '3302',
//     host: "localhost",
//     user: "user",
//     password: "test",
//     database: "mysql",
//     connectionLimit: 5
// })

// asyncFunction()

// async function asyncFunction() {
//   try {
//     var conn = await pool.getConnection();
//     const [res] = await conn.query("SHOW VARIABLES WHERE Variable_name = 'hostname'");
//     console.log("v1", res);
//     const [res2] = await conn.query("SHOW VARIABLES WHERE Variable_name = 'port'");
//     console.log("v2", res2)
//   }
//   catch (err) {
//     console.log("ended conn on err", err)
//   }

//   if(conn) return conn.end()
// }

// module.exports = pool;
// const mariadb = require('mariadb');
const postgres = require('postgres')

const sql = postgres({
  host: "localhost",
  username: 'postgres',
  password: 'test',
  database: 'postgres',
  port: 5430
})

// alter role postgres with password 'test';
// in /etc/postgresql/13/main/pg_hba.conf write => host all postgres 172.17.0.1/32 md5
// in /etc/postgresql/13/main/postgresql.conf write => listen_addresses = 'localhost, 172.17.0.2'
// 172.17.0.2 (should be the IP of the machine)

async function test() {
test = await sql`SELECT inet_server_addr()`
console.log("test", test)
test = await sql`SELECT * FROM pg_settings WHERE name = 'port'`
console.log("test", test)
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
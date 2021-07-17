const postgres = require('postgres')

const sql = postgres({
  host: "localhost",
  username: 'puser',
  password: 'test',
  database: 'cc',
  port: 5500
})

//postgres temp passowrd: test
//puser temp password: test

async function test() {
test = await sql`SELECT inet_server_addr()`
console.log("test", test)
test = await sql`SELECT * FROM pg_settings WHERE name = 'port'`
console.log("test", test)
test = await sql`SELECT * FROM public."USER" WHERE id = 1`
console.log("test", test)
}
test()

// module.exports = pool;
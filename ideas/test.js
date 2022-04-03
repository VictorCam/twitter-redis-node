const dayjs = require('dayjs')
const {nanoid} = require('nanoid')
const base62 = require("base62/lib/ascii")

//show the utc date

let unix_ms = dayjs().valueOf()
let id = base62.encode(unix_ms) + nanoid(4)

let length = base62.encode(dayjs().valueOf()).length + parseInt(process.env.NANOID_LEN)
console.log(length)

console.log(base62.encode(dayjs().valueOf()).length + parseInt("4"))

//url id
console.log(id)

// //convert unix_ms to a date
// let date = dayjs(unix_ms).format('MM/DD/YYYY h:mm a')

// //convert date to mountain time
// let mountain_time = dayjs(date).tz('America/Denver').format('MM/DD/YYYY h:mm a')

// console.log(mountain_time)

// //remove 5 characters from the back of the string
// n = n.substring(0, n.length - 5)
// base62.decode(n)

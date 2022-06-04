import base62 from 'base62/lib/ascii.js'



let test = "9"
// console.log(test)

// let test2 = base62.encode(test)
// console.log(test2)

let test3 = (base62.decode(test) % 2)+1
console.log(test3)

// console.log(str)
// let res = str % 100
// console.log(res)
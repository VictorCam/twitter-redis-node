import { V1 as paseto } from 'paseto'
(async () => {
  {
    let secretKey = await paseto.generateKey('local', {format: 'paserk'})
    console.log(secretKey)
    // const test = await paseto.encrypt({"test": "test"}, secretKey, {expiresIn: '7d'})
    // const payload = await paseto.decrypt(test, secretKey)
    // console.log(payload)
  }
})()
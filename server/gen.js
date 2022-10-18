import { V1 as paseto } from 'paseto'
(async () => {
  {
    let secretKey = await paseto.generateKey('local')
    secretKey = secretKey.export({type: 'pkcs8'}).toString('base64')
    console.log(secretKey)
    // const test = await paseto.encrypt({"test": "test"}, Buffer.from(secretKey, 'base64'), {expiresIn: '7d'})
    // const payload = await paseto.decrypt(test, Buffer.from(secretKey, 'base64'))
    // console.log(payload)
  }
})()
const CryptoJS = require("crypto-js")
const {Users} = require('../models')

exports.createCEO = async () => {
    const name = process.env.CEO_NAME
    const surname = process.env.CEO_SURNAME
    const phoneNumber = process.env.CEO_PHONE_NUMBER
    const password = process.env.CEO_PASSWORD
    try {
        const ceo = await Users.findOne(({phoneNumber: phoneNumber}))
        if (ceo != null) {
            return true
        }
        const newCeo = new Users({
            firstName: name,
            lastName: surname,
            role: 'CEO',
            phoneNumber: phoneNumber,
            password: CryptoJS.AES.encrypt(
                password,
                process.env.PASSWORD_SECRET_KEY
            ).toString(),
        })
        await newCeo.save()
        console.log("CEO yaratildi")
    } catch (err) {
        console.log(err)
        return false
    }
}
const {model, Schema} = require("mongoose")
const {schemaOptions} = require("./modelOptions")

function validPhoneNumber(phoneNumber) {
    // Telefon raqamini tekshirish uchun kerakli validatsiya loyihasini yozing.
    // Misol uchun, biz faqatraq formatni tekshirib ko'ramiz, lekin siz o'zingizning talablaringizga mos validatorlarni ishlatishingiz mumkin.
    const phoneRegex = /^\+998\d{9}$/; // +998 kodi bilan boshlangan 9 ta raqam
    return phoneRegex.test(phoneNumber);
}

const users = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    middleName: {
        type: String,
    },
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course',
    }],
    photo: {
        type: String,
        default: '/images/user.jpg'
    },
    role: {
        type: String,
        enum: ['ADMIN', 'MANAGER', 'CEO', 'TEACHER', 'STUDENT'],
    },
    type: {
        type: String,
        enum: ['REGISTER', 'NOT_COME', 'IS_READY']
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: validPhoneNumber,
            message: 'Noto\'g\'ri telefon raqami iltimos tekshirib qayta kiriting' // Xatolik xabari
        }
    },
    email: {
        type: String,
        default: "example@gmail.com"
    },
    lidTypes: {
        type: Schema.Types.ObjectId,
        ref: 'LidTypes',
    },
    isComeDescription: {
        type: String
    },
    password: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: true
    }
}, schemaOptions)

module.exports = model("Users", users)
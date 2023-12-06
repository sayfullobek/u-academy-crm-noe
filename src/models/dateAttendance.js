const {model, Schema} = require('mongoose')
const {schemaOptions} = require("./modelOptions")
const dayAttendanceSchema = new Schema({
    date: {
        type: Date,
    }, active: {
        type: String,
        enum: ["CAME", "NOT_CAME", "LATE"], //came -> keldi, not came -> kelmadi, late->kechikdi
        default: "NOT_CAME"
    }, howLate: {//qancha vaqt kechikkani agar kelmagan yoki kechikmagan bo'lsa saqlash shart emas
        type: String
    }, day: {//haftaning qaysi kuni
        type: String,
        enum: ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"]
    }, byWhom: {//Kim tomonidan yo'qlama bo'lgani
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
}, schemaOptions)

module.exports = model("DayAttendance", dayAttendanceSchema);
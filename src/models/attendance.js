const {model, Schema} = require('mongoose')
const {schemaOptions} = require("./modelOptions")
const attendanceSchema = new Schema({
    group: {
        type: Schema.Types.ObjectId,
        ref: "Group"
    }, student: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    }, monthlyAttendances: [{
        type: Schema.Types.ObjectId,
        ref: "MonthlyAttendance"
    }]
}, schemaOptions)

module.exports = model("Attendance", attendanceSchema);
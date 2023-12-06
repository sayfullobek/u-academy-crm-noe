const {model, Schema} = require('mongoose')
const {schemaOptions} = require("./modelOptions")
const monthlyAttendanceSchema = new Schema({
    month: {
        type: String,
        enum: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Dekabr"]
    }, dateAttendances: [{
        type: Schema.Types.ObjectId,
        ref: 'DateAttendance'
    }]
}, schemaOptions)

module.exports = model("MonthlyAttendance", monthlyAttendanceSchema);
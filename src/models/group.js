const {model, Schema} = require("mongoose")
const {SchemaOptions} = require("./modelOptions")

const group = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'Users'
    }],
    active: {
        type: Boolean,
        default: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    weekDays: {
        type: String,
        enum: ["Toq", "Juft", "Boshqa"],
        required: true
    },
    startHours: {
        type: String,
        required: true
    },
    endHours: {
        type: String,
        required: true
    }
}, SchemaOptions)

module.exports = model("Group", group)


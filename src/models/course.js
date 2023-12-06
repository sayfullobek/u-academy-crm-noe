const {Schema, model} = require("mongoose")
const {schemaOptions} = require("./modelOptions")
const courseSchema = new Schema({
    name: {
        type: String,
        require: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    photo: {
        type: String,
    }
}, schemaOptions)
module.exports = model('Course', courseSchema)
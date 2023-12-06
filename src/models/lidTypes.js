const {model, Schema} = require('mongoose')
const {schemaOptions} = require('./modelOptions')

const lidTypes = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }, logo: {
        type: String,
        required: true,
    }
}, schemaOptions)

module.exports = model("LidTypes", lidTypes);
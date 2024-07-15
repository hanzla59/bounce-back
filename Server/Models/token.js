const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    token:{
        type: String,
        required: true
    },
    userId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user'
    }
},{timestamps: true})

module.exports = mongoose.model('refreshtoken', tokenSchema, 'tokens')
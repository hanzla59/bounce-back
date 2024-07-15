const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    author:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user'
    },
    blog:{
        type: mongoose.SchemaTypes.ObjectId,
        ref:'blog'
    }
},{timestamps: true})


module.exports = mongoose.model('comments', commentSchema, 'comments');
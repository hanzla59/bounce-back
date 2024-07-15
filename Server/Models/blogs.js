const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    photopath:{
        type:String,
        required: true
    },
    author:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user'
    }
},{timestamps: true});

module.exports = mongoose.model('blog', blogSchema, 'blog');
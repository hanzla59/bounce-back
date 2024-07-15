const Joi = require('joi');
const comments = require("../Models/comments");
const CommentDTO = require("../dto/comment");

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const commentController = {

    async create(req, res, next) {
        const createCommentSchema = Joi.object({
            content: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattern).required(),
            blog: Joi.string().regex(mongodbIdPattern).required()
        });

        const { error } = createCommentSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { content, author, blog } = req.body;

        try {
            const newComment = new comments({
                content,
                blog,
                author
            });
            await newComment.save();
            return res.status(201).json({ message: "Comment Created Successfully" });
        } catch (error) {
            return next(error);
        }
    },
    async getById(req, res, next){

        const getByIdSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        })

        const {error} = getByIdSchema.validate(req.params);

        if(error){
            return next(error);
        }

        const {id} = req.params;

        let comment 
        try {
           comment = await comments.find({blog:id}).populate('author');
        } catch (error) {
            return next(error);
        }
        let commentsDTO = [];
        for(let i=0; i<comment.length; i++){
            const obj = new CommentDTO(comment[i]);
            commentsDTO.push(obj);
        }
        res.status(201).json({Comment: commentsDTO});

    },

    //update the comment 
    async update(req, res, next){
        const updateCommentSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required(),
            content: Joi.string().required()
        });

        const { error } = updateCommentSchema.validate({ ...req.params, ...req.body });

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { id } = req.params;
        const { content } = req.body;

        try {
            const updatedComment = await comments.findByIdAndUpdate(
                id,
                { content },
                { new: true }
            );

            if (!updatedComment) {
                return res.status(404).json({ message: "Comment not found" });
            }

            const commentDTO = new CommentDTO(updatedComment);
            return res.status(200).json({ message: "Comment Updated Successfully", comment: commentDTO });
        } catch (error) {
            return next(error);
        }
    },

    //delete the comment 

    async delete(req, res, next){
        const deleteCommentSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        });

        const { error } = deleteCommentSchema.validate(req.params);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { id } = req.params;

        try {
            const comment = await comments.findByIdAndDelete(id);

            if (!comment) {
                return res.status(404).json({ message: "Comment not found" });
            }

            return res.status(200).json({ message: "Comment Deleted Successfully" });
        } catch (error) {
            return next(error);
        }

    }
}

module.exports = commentController;

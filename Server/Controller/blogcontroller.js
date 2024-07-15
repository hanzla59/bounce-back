const Joi = require('joi');
const fs = require('fs');
const blog = require("../Models/blogs");
const dotenv = require('dotenv');
const BlogDTO = require("../dto/blog");
const Comment = require("../Models/comments");

dotenv.config();

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const blogcontroller = {

    //create blog
    async create(req, res, next){

        const createBlogSchema = Joi.object({
            title: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattern).required(),
            content: Joi.string().required(),
            photo: Joi.string().required()
        })
        const {error} = createBlogSchema.validate(req.body);

        if(error){
            return next(error);
        }

        const {title, author, content, photo} = req.body;

        //handle photo
        //read as buffer
        const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');
        //give random number
        const imagePath = `${Date.now()}-${author}.png`;
        //save locally
        try {
            fs.writeFileSync(`Storage/${imagePath}`, buffer);
        } catch (error) {
            return  next(error);
        }

        //save blog in database 
        let newBlog
        try {
            newBlog = new blog({
                title,
                content, 
                photopath: `${process.env.BACKEND_SERVER_PATH}/Storage/${imagePath}`,
                author,
            }) 
            await newBlog.save();
        } catch (error) {
            return next(error);
        }
        const blogdto = new BlogDTO(newBlog);
        return res.status(201).json({blog: blogdto});


    },

    //get All Blogs
    async getAll(req, res, next){
        try {
            const blogs = await blog.find({});
            if (!blogs) {
                return res.status(404).json({ message: "No blogs found" });
            }
            const blogsDTO = blogs.map(blogItem => new BlogDTO(blogItem));
            return res.status(200).json({ blogs: blogsDTO });
        } catch (error) {
            console.error("Error fetching blogs:", error);
            return next(error);
        }

    },

    //get blogs by id
    async getById(req, res, next){
        const getByIdSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        });
        const { error } = getByIdSchema.validate(req.params);
    
        if (error) {
            return next(error);
        }
    
        const { id } = req.params;
    
        try {
            const blogbyId = await blog.findOne({ _id: id }).populate('author');
            if (!blogbyId) {
                return res.status(404).json({ message: "Blog not found" });
            }
            const blogdto = new BlogDTO(blogbyId);
            return res.status(200).json({ blog: blogbyId });
        } catch (error) {
            return next(error);
        }
    },

    //update blogs
    async update(req, res, next){

        const updateBlogSchema = Joi.object({
            title: Joi.string().required(),
            content: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattern).required(),
            blogId: Joi.string().regex(mongodbIdPattern).required(),
            photo: Joi.string()
        });

        const { error } = updateBlogSchema.validate(req.body);
        if (error) {
            return next(error);
        }

        const { title, content, author, blogId, photo } = req.body;

        let Blog;
        try {
            Blog = await blog.findOne({ _id: blogId });
            if (!Blog) {
                return res.status(404).json({ message: "Blog not found" });
            }
        } catch (error) {
            return next(error);
        }

        if (photo) {
            let previousPhoto = Blog.photopath;
            previousPhoto = previousPhoto.split('/').pop();

            // Check if the file exists before deleting
            const previousPhotoPath = `Storage/${previousPhoto}`;
            if (fs.existsSync(previousPhotoPath)) {
                try {
                    fs.unlinkSync(previousPhotoPath);
                } catch (error) {
                    return next(error);
                }
            }

            const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');
            const imagePath = `${Date.now()}-${author}.png`;

            try {
                fs.writeFileSync(`Storage/${imagePath}`, buffer);
            } catch (error) {
                return next(error);
            }

            try {
                await blog.updateOne(
                    { _id: blogId },
                    { title, content, photopath: `${process.env.BACKEND_SERVER_PATH}/Storage/${imagePath}` }
                );
            } catch (error) {
                return next(error);
            }
        } else {
            try {
                await blog.updateOne(
                    { _id: blogId },
                    { title, content }
                );
            } catch (error) {
                return next(error);
            }
        }

        return res.status(201).json({ message: "Blog Update Successfully" });
    },

    //delete blogs
    async delete(req, res, next){

        const deleteBlogSchem = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        });
        const {error} = deleteBlogSchem.validate(req.params);

        if(error){
            return next(error);
        }

        const{ id } = req.params;

        try {
            await blog.deleteOne({_id:id});
            await Comment.deleteMany({blog:id});

        } catch (error) {
            return next(error);
        }
        res.status(201).json({message: "Blog Deleted Successfully"});
    }

};

module.exports = blogcontroller;
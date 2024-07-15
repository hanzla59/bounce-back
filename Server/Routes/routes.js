const express = require('express');
const router = express.Router();
const auth = require("../MiddleWare/auth");
const authController = require('../Controller/authcontroller');
const blogcontroller = require("../Controller/blogcontroller");
const commentController = require("../Controller/commentcontroller");


router.get("/",(req,res)=>{
    res.status(200).json("Routes Working Properly")
})

//Routes For User Authentication

//Register
router.post("/register", authController.register)

//login
router.post("/login", authController.login);

//logout 
router.post("/logout", auth, authController.logout);

//refresh
router.get("/refresh", auth, authController.refresh);

//Routes For Blogs

//createBlog
router.post("/blog", auth, blogcontroller.create);

//get ALl Blogs
router.get("/blog/all", auth, blogcontroller.getAll);

//get Blogs by ID
router.get("/blog/:id", auth, blogcontroller.getById);

//update Blogs
router.put("/blog", auth, blogcontroller.update);

//delete
router.delete("/blog/:id", auth, blogcontroller.delete);


//Routes For Comment

//Create Comment
router.post("/comment", auth, commentController.create);

//get All Comments by Blog Id
router.get("/comment/:id", auth, commentController.getById);

//update the comment
router.put("/comment/:id", auth, commentController.update)

//delete the comment 
router.delete("/comment/:id", auth, commentController.delete);

module.exports = router;
const Joi = require('joi');
const bcrypt = require('bcrypt');
const user = require("../Models/users");
const JWTService = require("../Services/JWTService");
const RefreshToken = require("../Models/token");

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,25}$/;
const authController = {

    //Register User

    async register(req, res, next){


        const userRegisterSchema = Joi.object({
            name: Joi.string().max(30).required(),
            username: Joi.string().min(5).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
            confirmPassword: Joi.ref('password')
        });
        const { error } = userRegisterSchema.validate(req.body);

        if(error){
            return next(error);
        }

        const { name, username, email, password } = req.body;

        try {
            const emailInUse = await user.exists({email});
            const usernameInUse = await user.exists({username});

            if(emailInUse){
                const error = {
                    status: 409,
                    message: "email already in use"
                }
                return next(error);
            }

            if(usernameInUse){
                const error = {
                    status: 409,
                    message: "username already in use"
                }
                return next(error);
            }



        } catch (error) {
            return next(error);
        }
        
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const registerUser = new user ({
            name,
            username,
            email,
            password: hashedPassword
        })

        await registerUser.save();

        let accessToken;
        let refreshToken;
        try {
            accessToken = JWTService.signAccessToken({_id: registerUser._id}, '30m');
            refreshToken = JWTService.signRefreshToken({_id:registerUser._id}, '60m');

        } catch (error) {
            return next(error);
        }

        await JWTService.storeRefreshToken(refreshToken, registerUser._id)

        res.cookie('accessToken', accessToken, {
            maxAge: 1000*60*60*24,
            httpOnly: true
        });

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000*60*60*24*7,
            httpOnly: true
        })

        res.status(200).json({
            message: "User Register Successfully",
            user:{
                id: registerUser._id,
                name: registerUser.name,
                email: registerUser.email
            },
            auth: true
        });
        
    },

    //login User

    async login(req, res, next) {
        const userLoginSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            password: Joi.string().pattern(passwordPattern).required()
        });

        const { error } = userLoginSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        const { username, password } = req.body;

        try {
            const checkusername = await user.findOne({ username });

            if (!checkusername) {
                const error = {
                    status: 401,
                    message: "Invalid username"
                };
                return next(error);
            }

            const checkpassword = await bcrypt.compare(password, checkusername.password);

            if (!checkpassword) {
                const error = {
                    status: 401,
                    message: "Invalid password"
                };
                return next(error);
            }

            const accessToken = JWTService.signAccessToken({_id: checkusername._id},'30m');
            const refreshToken = JWTService.signRefreshToken({_id: checkusername._id}, '60m');

            try {
                await RefreshToken.updateOne({
                    _id: checkusername._id
                },{
                    token: refreshToken
                },{upsert: true})
            } catch (error) {
                return next(error);
            }


            //Send Cookies

            res.cookie('accessToken', accessToken, {
                maxAge: 1000*60*60*24,
                httpOnly: true
            });

            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000*60*60*24*7,
                httpOnly: true
            })

            res.status(200).json({
                message: "User Logged In Successfully",
                user: {
                    id: checkusername._id,
                    name: checkusername.name,
                    email: checkusername.email
                },
                auth: true
            });

        } catch (error) {
            return next(error);
        }
    },

    // Logout
    
    async logout(req, res, next) {
        const { refreshToken } = req.cookies;
    
        //delete token from database
        try {
            await RefreshToken.deleteOne({ token: refreshToken });
        } catch (error) {
            return next(error);
        }
    
        //clear cookies 
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
    
        res.status(200).json({ message: "Logout Successfully", auth: false });
    },

    //Refresh
    async refresh(req, res, next) {
        const originalRefreshToken = req.cookies.refreshToken;
        let id;
        try {
            id = JWTService.verifyRefreshToken(originalRefreshToken)._id;
            const match = await RefreshToken.findOne({_id: id, token:originalRefreshToken});
            if(!match){
                const error = {
                    status: 401,
                    message: "UnAuthorized",
                }
                return next(error);
            }
            const accessToken = JWTService.signAccessToken({_id:id}, '30m');
            const refreshToken = JWTService.signRefreshToken({_id:id}, '60m');

            await RefreshToken.updateOne({_id:id},{token:refreshToken});

            res.cookie('accessToken', accessToken, {
                maxAge: 1000*60*60*24,
                httpOnly: true
            });

            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000*60*60*24*7,
                httpOnly: true
            });

            const User = await user.findOne({_id:id});
            const userDTO = {
                name: User.name,
                username: User.username,
                email: User.email
            }

            return res.status(200).json({user: userDTO, auth:true});

        } catch (error) {
            return next(error);
        }

    }
}

module.exports = authController;
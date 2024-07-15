const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const refreshtoken = require("../Models/token");
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET


class JWTService{
    static signAccessToken(payload, expiryTime){
        return jwt.sign(payload, ACCESS_TOKEN_SECRET, {expiresIn: expiryTime})
    }

    static signRefreshToken(payload, expiryTime){
        return jwt.sign(payload, REFRESH_TOKEN_SECRET, {expiresIn: expiryTime})
    }

    static verifyAccessToken(token){
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    }

    static verifyRefreshToken(token){
        return jwt.verify(token, REFRESH_TOKEN_SECRET)
    }

    static async storeRefreshToken(token, userId){
        try {
            const newToken = new refreshtoken({
                token: token,
                userId: userId
            });

            await newToken.save()
        } catch (error) {
            console.log("error");
        }
    }

}

module.exports = JWTService;
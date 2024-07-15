const user = require("../Models/users");
const JWTService = require("../Services/JWTService");

const auth = async (req, res, next) => {
    const { refreshToken, accessToken } = req.cookies;

    if (!refreshToken || !accessToken) {
        const error = {
            status: 401,
            message: "Unauthorized Access"
        };
        return next(error);
    }

    let decodedToken;
    try {
        decodedToken = JWTService.verifyAccessToken(accessToken);
    } catch (error) {
        return next({
            status: 401,
            message: "Invalid Access Token"
        });
    }

    let User;
    try {
        User = await user.findById(decodedToken._id);
        if (!User) {
            return next({
                status: 401,
                message: "Unauthorized Access"
            });
        }
    } catch (error) {
        return next(error);
    }

    const userDTO = {
        _id: User._id,
        username: User.username,
        email: User.email
    };

    req.user = userDTO;
    next();
};

module.exports = auth;

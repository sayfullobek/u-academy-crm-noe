const jwt = require('jsonwebtoken');
const {Users} = require('../models');

const tokenDecode = (req) => {
    const bearerHeader = req.headers.authorization
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ')[1];
        try {
            return jwt.verify(
                bearer,
                process.env.JWT_SECRET_KEY);
        } catch (err) {
            return false;
        }
    } else {
        return false;
    }
}

exports.verifyUsersToken = async (req, res, next) => {
    try {
        const tokenDecoded = tokenDecode(req);
        if (tokenDecoded) {
            const users = await Users.findById(tokenDecoded.id);
            if (!users) return res.status(401).json({message: 'No allowed'});
            req.users = users;
            next();
        } else {
            return res.status(401).json({message: 'Unauthorized'});
        }
    } catch (err) {
        res.status(500).json({err: err})
    }
}
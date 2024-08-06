const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const session = require('express-session');

const authMiddleware = {
    ensureAuthenticated: (req, res, next) => {
        if (req.session.user) {
            return next();
        }
        res.redirect('/login');
    },

    checkUser: async (req, res, next) => {
        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            req.session.user = user;
            next();
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }
};

module.exports = authMiddleware;

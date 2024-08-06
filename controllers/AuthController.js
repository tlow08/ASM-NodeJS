const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
// const Joi = require("joi");

// const registerSchema = Joi.object({
//    username: Joi.string().min(6).required().messages({
//     "string.base": "Ten nguoi dung phai la 1 doan van ban",
//     "string.empty" : "Username khong duoc de trong",
//     "string.min": "Co toi thieu {#limit}",
//     "any.required": "Bat buoc phai nhap"
//    }),
//    email: Joi.string().email().required().message({
//     "string.email": "Nhap email dung dinh dang",
//     "string.empty" : "Email khong duoc de trong",
//     "any.required" : "Bat buoc phai nhap"
//    }),
//    password: Joi.string().min(6).required().message({
//     "string.min": "Toi thieu {#limit} ky tu",
//     "string.empty": "Khong duoc de trong",
//     "any.required": "Bat buoc phai nhap"
//    })
// })

exports.listUser = async( req, res)=>{
    try{
        const users = await User.find();
        res.render('admin/listUsers', {listUser: users})
    }catch(error){
        console.log(error);
    }
}
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const errors = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (username.length < 5) {
            errors.push('Username must be at least 5 characters long');
        }

        if (!emailRegex.test(email)) {
            errors.push('Invalid email format');
        }

        if (password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        const existedEmail = await User.findOne({ email });
        if (existedEmail) {
            errors.push('Email already exists');
        }

        if (errors.length > 0) {
            return res.render('register', { errors, username, email, password });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        if (newUser) {
            console.log("Registration successful");
            return res.redirect("/login"); // Ensure to return here
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error'); // Send an appropriate server error
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const errors = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Kiểm tra email
        if (!email) {
            errors.push('Email is required');
        } else if (!emailRegex.test(email)) {
            errors.push('Invalid email format');
        }

        // Kiểm tra password
        if (!password) {
            errors.push('Password is required');
        }

        if (errors.length > 0) {
            return res.render('login', { errors, email });
        }

        const user = await User.findOne({ email });

        if (!user) {
            errors.push("Email not found");
            return res.render('login', { errors, email }); // Hiển thị lỗi và truyền email
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            errors.push("Invalid password");
            return res.render('login', { errors, email }); // Hiển thị lỗi và truyền email
        }

        const token = jwt.sign({ id: user.id }, 'WD18411-asm', { expiresIn: '1h' });

        if (token) {
            req.session.user = user;
            return res.redirect('/admin/dashboard');
        } else {
            errors.push("Login failed");
            return res.render('login', { errors, email }); // Hiển thị lỗi nếu không tạo được token
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

// API handling for registration
exports.apiRegister = async (req, res) => {
    try{
        const existedEmail = await User.findOne({email: req.body.email});
        if(existedEmail){
            return res.status(400).json({
                message: "Email da ton tai"
            });
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });
        res.status(201).json({
            message: "dang ky thanh cong",
            data: newUser,
        })
    }catch{
        res.status(400).json({message: 'Error'});
    }
};

exports.apiLogin = async (req, res) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});

        if(!user){
            return res.status(404).json({message: "Email khong ton tai!"});
        }
        const token = jwt.sign({id: user.id}, 'WD18411', {expiresIn: '1h'});
        res.status(200).json({
            message: "Successfully",
            token
        })
    }catch{
        res.status(400).json({message: "Error"});
    }
}

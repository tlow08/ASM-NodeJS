
const express = require("express");
const multer = require('multer');
const session = require("express-session");

const mongoose = require("mongoose");
const ProductController = require("./controllers/ProductController");
const AuthController = require("./controllers/AuthController");
const app = new express();
const port = 3000;

app.use(session({
    secret: 'your_secret_key', // Replace with your own secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());


const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/images');
    },
    filename: function(req, file, cb){
        cb(null, `${Date.now()}-${file.originalname}`);
    }
})
const upload = multer({storage: storage});



mongoose.connect("mongodb://localhost:27017/wd18411-asm")
.then(result => {
    app.get('/', (req, res) => {
        res.render('index');
      });
    app.get('/detail/:id', ProductController.getDetail);
    app.get('/shop',ProductController.shop);
    //Auth 
    app.get('/register', (req, res)=> res.render('register'));
    app.post('/register', AuthController.register );
    app.get('/login', (req, res)=> res.render('login'));
    app.post('/login', AuthController.login);
    // app.get('/logout', AuthController.logout);

    app.get('/admin/dashboard', (req, res)=>{
        res.render('admin/dashboard');
    });
    app.get('/admin/listProduct', ProductController.getList);
    app.get('/admin/listUser', AuthController.listUser);
    app.get('/admin/createProduct', ProductController.create);
    app.get('/admin/editProduct/:id', ProductController.edit);
    app.post('/admin/save', upload.single("thumbnail"), ProductController.save);
    app.post('/admin/updateProduct/:id', upload.single("thumbnail"), ProductController.update);
    app.post('/admin/deleteProduct/:id', ProductController.delete);

    //API
    app.get('/products', ProductController.apiGetList);
    app.get('/products/:id', ProductController.apiGetDetail);
    app.post('/products',upload.single("thumbnail"), ProductController.apiAddProduct);
    app.patch('/products/:id', upload.single("thumbnail"), ProductController.apiUpdateProduct);
    app.delete('/products/:id', ProductController.apiRemoveProduct);

    app.post('/auth/register', AuthController.apiRegister);
    app.post('/auth/login', AuthController.apiLogin);
    app.listen(port, ()=>{
        console.log(`Running in port ${port}`)
    })
})
.catch(err=>{
    console.error(err);
})

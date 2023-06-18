import mysql from "mysql";
import path from "path";
import express from "express";
import session from "express-session";
import crypto from "crypto";
import memoryStore from 'memorystore';
import { getProductData } from './models/productModel.js'
import { getAccountData } from "./models/accountSearchModel.js";
import productDetailsController from './controllers/product-details_controller.js';
import addReviewController from './controllers/add-review_controller.js';

const PORT = 8080;
const app = express();
const sessionStore = memoryStore(session);
app.use(
    session({
        cookie: {
            httpOnly: false,
            sameSite: 'strict',
            maxAge: 1*60*60*1000
        },
        store: new sessionStore({
            checkPeriod: 1*60*60*1000
        }),
        secret: "my_secret",
        resave: true,
        saveUninitialized: true,
        logged_in: false
    })
);
const pool = mysql.createPool({
    user: "root",
    password: "",
    database: "review_tas",
    host: "localhost",
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const staticPath = path.resolve("public");
app.use(express.static(staticPath));

const dbConnect = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err) {
                reject(err);
            } else {
                resolve(conn);
            }
        });
    });
};

const getBrands = (conn) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT namaMerk AS brand FROM merk";
    conn.query(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        const brands = [];
        for (let row of result) {
          brands.push(row.brand);
        }
        resolve(brands);
      }
    });
  });
};

const getCategories = (conn) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT namaKategori AS category FROM kategori";
    conn.query(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        const categories = [];
        for (let row of result) {
          categories.push(row.category);
        }
        resolve(categories);
      }
    });
  });
};

const checkEmail = (conn, email)=>{
    return new Promise((resolve, reject)=>{
        conn.query('SELECT * FROM Publik WHERE emailPengguna = ?', [email],(err, result)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        });
    });
};

const checkUsername = (conn, username)=>{
    return new Promise((resolve, reject)=>{
        conn.query('SELECT * FROM Publik WHERE username = ?', [username],(err, result)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        });
    });
};

const insertData = (conn, firstName, lastName, username, email, password)=>{
    return new Promise((resolve, reject)=>{
        const date = new Date();
        conn.query('INSERT INTO Publik (password, username, firstName, lastName, emailPengguna, accountCreatedDate) VALUES (?, ?, ?, ?, ?, ?)', [password, username, firstName, lastName, email, date],(err, result)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        });
    });
};

const getTopTenRating = (conn) =>{
    return new Promise((resolve, reject)=>{
        let query = "SELECT t.idTas, t.namaTas, t.foto, t.deskripsi, t.warna, t.panjang, t.lebar, t.tinggi, ";
        query += "ROUND(AVG(r.rateValue), 2) AS averageRateValue, COUNT(r.id) AS personCounter";
        query += " FROM Tas t JOIN Review r ON t.idTas = r.idTas";
        query += " GROUP BY t.namaTas, t.foto ";
        query += " ORDER BY personCounter DESC, averageRateValue DESC";

        conn.query(query, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
        });
    });
};

app.get("/", async (req, res, next) => {
    try {
      const conn = await dbConnect();
      const topten_review = await getTopTenRating(conn);
      res.render("home", { topten_review });
    } catch (err) {
      next(err);
    }
  });
  
app.get("/login", async(req,res) => {
    if(req.session.logged_in){
        res.redirect('/dashboard-public');
    }
    else{
        res.render("login-public",{
            emailProblem: '',
            passwordProblem: '',
            loginProblem: ''
        });
    }
});
app.get("/signup", async(req,res) => {
    res.render("signup", {
        emailProblem: '',
        usernameProblem: '',
        passwordProblem: '',
        signupProblem: ''
    });
});
app.get('/adminlogin', async(req, res) => {
    res.render('login-admin');
});
app.get("/dashboard-public", async(req,res) => {
    res.render("dashboard-public",{
        user: req.session.username
    })
});
app.post("/signup", async (req, res) => {
    // terima nama, email, pass, confirm pass
    const{ firstName, lastName, email, username, password, confirmpassword } = req.body;

    // cek form kosong
    if(firstName!="" && lastName!="" && email!="" && username!="" && password!= "" && confirmpassword!=""){ 
        // validasi database
        const signedUpEmail = await checkEmail(await dbConnect(), email);
        const signedUpUsername = await checkUsername(await dbConnect(), username);

        // belum ada pengguna dengan email tersebut
        if(signedUpEmail.length == 0 && signedUpUsername.length == 0){
            //cek password match
            if(password == confirmpassword){ // jika match
                // insert database
                insertData(await dbConnect(), firstName, lastName, username, email, password).then((result)=>{
                    // redirect ke dashboard public
                    res.redirect("/dashboard-public");
                });
            }
            else{ // jika tidak match
                // pesan kesalahan
                res.render("signup", {
                    emailProblem: '',
                    usernameProblem: '',
                    passwordProblem: 'Password does not match',
                    signupProblem: ''
                });
            }
        }
        else if(signedUpEmail.length != 0 && signedUpUsername.length == 0){ //sudah ada pengguna dengan email tersebut
            res.render("signup", {
                emailProblem: 'Email already registered',
                usernameProblem: '',
                passwordProblem: '',
                signupProblem: ''
            });
        }
        else if(signedUpEmail.length == 0 && signedUpUsername.length != 0){ //sudah ada pengguna dengan username tersebut
            res.render("signup", {
                emailProblem: '',
                usernameProblem: 'Username already exists',
                passwordProblem: '',
                signupProblem: ''
            });
        }
        else{
            res.render("signup", {
                emailProblem: 'Email already registered',
                usernameProblem: 'Username already exists',
                passwordProblem: '',
                signupProblem: ''
            });
        }
    }
    else{
        // pesan kesalahan
        res.render("signup", {
            emailProblem: '',
            usernameProblem: '',
            passwordProblem: '',
            signupProblem: 'Please insert all the form'
        });
    }
});

app.post("/login", async(req,res)=>{
    const{ email, password} = req.body;
    if(email!="" && password!=""){
        const signedUpEmail = await checkEmail(await dbConnect(), email);
        if(signedUpEmail.length==0){
            //email belum terdaftar
            res.render("login-public",{
                emailProblem: 'Email does not exists',
                passwordProblem: '',
                loginProblem: ''
            });
        }
        else{
            const registeredPassword = signedUpEmail[0].password;
            if(registeredPassword == password){
                //jika pass sesuai maka login berhasil
                req.session.logged_in = true;
                req.session.username = signedUpEmail[0].username;
                res.redirect('/dashboard-public');
            }
            else{
                //jika tidak maka tetap di halaman login
                res.render("login-public",{
                    emailProblem: '',
                    passwordProblem: 'Wrong password',
                    loginProblem: ''
                });
            }
        }
    }
    else{
        res.render("login-public",{
            emailProblem: '',
            passwordProblem: '',
            loginProblem: 'Please insert all the form'
        });
    }
});

app.get("/account-publik", async(req,res)=>{
    res.render('account-publik',{
        user: req.session.username
    });
})

app.get("/filter", async (req, res) => {
    try {
        const conn = await dbConnect();
        const searchParams = req.query.search || "";
        const selectedBrand = req.query.brand || "";
        const selectedCategory = req.query.category || "";
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = 3;
        
        const brands = await getBrands(conn);
        const categories = await getCategories(conn);
        
        const products = await getProductData(conn, searchParams, selectedBrand, selectedCategory);
        const totalProducts = products.length;
        const totalPages = Math.ceil(totalProducts / itemsPerPage);
        
        const accounts = await getAccountData(conn, searchParams);
        
        const paginatedProducts = [];
        const start = (page - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, products.length);

        for (let i = start; i < end; i++) {
            paginatedProducts.push(products[i]);
        }

        res.render('filter', {
            user: req.session.username, 
            brands,
            categories,
            // subCategories,
            products: paginatedProducts,
            accounts,
            currentPage: page,
            totalPages: totalPages,
            req
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
});

app.get('/product-details?:id', productDetailsController);
app.post("/add-review", addReviewController);

export { dbConnect };

app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}!`);
});

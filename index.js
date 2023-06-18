import mysql from "mysql";
import path from "path";
import express from "express";
import session from "express-session";
import crypto from "crypto";
import memoryStore from 'memorystore';
import multer from 'multer';
import { render_account_publik, follow_transaction} from './account_controller/account.js';
import { render_my_account} from './my_account_controller/myaccount-controller.js';

const PORT = 8080;
const app = express();
const sessionStore = memoryStore(session);
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'public/img/');
    },
    filename: (req, file, cb) =>{
        cb(null, new Date().getTime()+'-'+file.originalname);
    }
});

const fileFilter = (req, file, cb)=>{
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
};

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
        resave: false,
        saveUninitialized: false,
        logged_in: false,
        role: 0
    })
);
const upload = multer({storage: fileStorage, fileFilter: fileFilter});

const pool = mysql.createPool({
    user: "root",
    password: "",
    database: "IDE",
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

const checkEmailAdmin = (conn, email)=>{
    return new Promise((resolve, reject)=>{
        conn.query('SELECT * FROM Admin WHERE emailPengguna = ?', [email],(err, result)=>{
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

const updateFoto = (conn, fotoPath, idPengguna)=>{
    return new Promise((resolve, reject)=>{
        conn.query('UPDATE Publik SET fotoProfile = ? WHERE id = ?', [fotoPath, idPengguna], (err, result)=>{
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
        const fotoPath = '../img/user-no-profile.png';
        conn.query('INSERT INTO Publik (password, username, firstName, lastName, emailPengguna, accountCreatedDate, fotoProfile) VALUES (?, ?, ?, ?, ?, ?, ?)', [password, username, firstName, lastName, email, date, fotoPath],(err, result)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        });
    });
};

const checkMiddlewarePublicOnly = (req, res, next)=>{
    if(req.session.logged_in && req.session.role==1){
        next();
    }
    else{
        res.status(403).send();
    }
}

const checkMiddlewareAdminOnly = (req, res, next)=>{
    if(req.session.logged_in && req.session.role==2){
        next();
    }
    else{
        res.status(403).send();
    }
}

const checkMiddlewareAdminPublic = (req, res, next)=>{
    if(req.session.logged_in && (req.session.role==1 || req.session.role==2)){
        next();
    }
    else{
        res.status(403).send();
    }
}

app.get("/", async(req,res) => {
    // const conn = await dbConnect();
    if(req.session.logged_in){
        res.redirect('/dashboard-public');
    }
    else{
        res.render("home");
    }
});
app.get("/login", async(req,res) => {
    if(req.session.logged_in && req.session == 1){
        res.redirect('/dashboard-public');
    }
    else if(req.session.role = 2){
        res.redirect('dashboard-admin'); //redirect ke dashboard admin
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
    if(req.session.logged_in && req.session.role == 1){
        res.redirect('/dashboard-public');
    }
    else if(req.session.role == 2){
        res.redirect('dashboard-admin'); //redirect ke dashboard admin
    }
    else{
        res.render("signup", {
            emailProblem: '',
            usernameProblem: '',
            passwordProblem: '',
            signupProblem: ''
        });
    }
});
app.get('/adminlogin', async(req, res) => {
    if(req.session.logged_in && req.session.role == 2){
        res.redirect('dashboard-admin'); //redirect ke dashboard admin
    }
    else if(req.session.role == 1){
        res.redirect('/dashboard-public');
    }
    else{
        res.render("login-admin", {
            emailProblem: '',
            passProblem: '',
            submitProblem: ''
        });
    }
    res.render('login-admin');
});
app.post('/adminlogin', async(req, res)=>{
    const{email, password} = req.body;
    if(email != "" && password != ""){
        const signedUpData = await checkEmailAdmin(await dbConnect(), email);
        if(signedUpData.length==0){
            res.render("login-admin", {
                emailProblem: 'Email does not exists',
                passProblem: '',
                submitProblem: ''
            });
        }
        else{
            if(signedUpData[0].password == password){
                //isi section yang butuh
                req.session.logged_in = true;
                req.session.email = email;
                req.session.role = 2;
                res.redirect('dashboard-admin'); //redirect dashboard public
            }
            else{
                res.render("login-admin", {
                    emailProblem: '',
                    passProblem: 'Wrong password',
                    submitProblem: ''
                });
            }
        }
    }
    else{
        res.render("login-admin", {
            emailProblem: '',
            passProblem: '',
            submitProblem: 'Please insert all fields'
        });
    }
});
app.get("/dashboard-public", checkMiddlewareAdminPublic, async(req,res) => {
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
                await insertData(await dbConnect(), firstName, lastName, username, email, password).then(async (result)=>{
                    const signedUpData = await checkEmail(await dbConnect(), email);
                    req.session.logged_in = true;
                    req.session.email = email;
                    req.session.username = signedUpData[0].username;
                    req.session.idPengguna = signedUpData[0].id;
                    req.session.namaLengkap = signedUpData[0].firstName+" "+signedUpData[0].lastName;
                    req.session.foto = signedUpData[0].fotoProfile;
                    req.session.role = 1;
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
            signupProblem: 'Please insert all fields'
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
                req.session.email = email;
                req.session.username = signedUpEmail[0].username;
                req.session.idPengguna = signedUpEmail[0].id;
                req.session.namaLengkap = signedUpEmail[0].firstName+" "+signedUpEmail[0].lastName;
                req.session.foto = signedUpEmail[0].fotoProfile;
                req.session.role = 1;
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
            loginProblem: 'Please insert all fields'
        });
    }
});

app.get("/my-account", checkMiddlewarePublicOnly, render_my_account);
app.get("/account-publik", checkMiddlewarePublicOnly, render_account_publik);
app.post("/follow-person", checkMiddlewarePublicOnly, follow_transaction);
app.get('/logout', checkMiddlewarePublicOnly, async (req, res)=>{
    req.session.logged_in = false;
    req.session.email = null;
    req.session.username = null;
    req.session.idPengguna = null;
    req.session.namaLengkap = null;
    req.session.foto = null;
    req.session.role = 0;
    res.redirect('/');
});
app.post('/my-account', upload.single('image'), async (req, res)=>{
    if(req.file){
        const fotoPath = '../img/'+req.file.filename;
        const idPengguna = req.session.idPengguna;
        await updateFoto(await dbConnect(), fotoPath, idPengguna);
        let result = fotoPath;
        req.session.foto = fotoPath;
        res.send({response:result});
    }
    else {
        res.status(400).send('Tidak ada gambar yang diunggah!');
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}!`);
});
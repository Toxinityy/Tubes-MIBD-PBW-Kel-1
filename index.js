import mysql from "mysql";
import path from "path";
import express from "express";
import session from "express-session";
import crypto from "crypto";
import memoryStore from 'memorystore';

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

app.get("/", async(req,res) => {
    // const conn = await dbConnect();
    res.render("home");
});
app.get("/login", async(req,res) => {
    if(req.session.logged_in){
        res.redirect('/dashboard-public');
    }
    else{
        res.render("login-public");
    }
});
app.get("/signup", async(req,res) => {
    res.render("signup");
});
app.get("/dashboard-public", async(req,res) => {
    res.render("dashboard-public",{
        user: req.session.username
    })
});
app.post("/auth", async (req, res) => {
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
                res.redirect("/signup");
            }
        }
        else{ //sudah ada pengguna dengan email atau username tersebut
            res.redirect("/signup");
        }
    }
    else{
        // pesan kesalahan
        res.redirect("/signup");
    }
});

app.post("/login-auth", async(req,res)=>{
    const{ email, password} = req.body;
    const signedUpEmail = await checkEmail(await dbConnect(), email);
    if(signedUpEmail.length==0){
        //email belum terdaftar
        res.redirect('/login');
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
            res.redirect('/login');
        }
    }
});

app.get("/account-publik", async(req,res)=>{
    res.render('account-publik',{
        user: req.session.username
    });
})

app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}!`);
});

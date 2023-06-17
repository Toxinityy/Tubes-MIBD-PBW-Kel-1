import mysql from "mysql";
import path from "path";
import express from "express";
import session from "express-session";
import crypto from "crypto";
import memoryStore from 'memorystore';
import Chart from 'chart.js/auto';

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
app.get('/select-input', async(req, res) => {
    res.render('admin/select-input');
});
//hapus ntar pake ajax
app.get('/additems', async(req, res) => {
    res.render('admin/additems');
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

app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}!`);
});

//dapetin brand
const getBrands = conn => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM Merk ORDER BY namaMerk ASC';
        conn.query(query, (err, result) => {
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        })
    })
}
//dapetin kategori
const getKategori = conn => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM Kategori ORDER BY namaKategori ASC';
        conn.query(query, (err, result) => {
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        })
    })
}
//dapetin subkategori
const getSubKat = conn => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM SubKategori ORDER BY namaSubKategori ASC';
        conn.query(query, (err, result) => {
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        })
    })
}
//dapetin designer
const getDesigner = conn => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM Designer ORDER BY namaDesigner ASC';
        conn.query(query, (err, result) => {
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        })
    })
}
//dapetin tas
const getBag = conn => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM Tas ORDER BY namaTas ASC';
        conn.query(query, (err, result) => {
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        })
    })
}
//dapetin review
const getReview = conn => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM Review';
        conn.query(query, (err, result) => {
            if(err){
                reject(err);
            }else{
                resolve(result);
            }
        })
    })
}
app.get('/stat', async(req, res) => {
    const conn = await dbConnect();
    const brands = await getBrands(conn);
    const category = await getKategori(conn);
    const subcategory = await getSubKat(conn);
    const review = await getReview(conn);
    const query = 'SELECT t.namaK'
    // SELECT t.namaTas, AVG(r.rateValue) AS meanRating
    // FROM Tas t
    // JOIN Review r ON t.idTas = r.idTas
    // GROUP BY t.idTas
    res.render('admin/stat', {
        brands: brands,
        category: category,
        subcategory: subcategory,
        review: review
    });
});
app.get('/additems', async(req, res) => {
    const conn = await dbConnect();
    const brands = await getBrands(conn);
    const category = await getKategori(conn);
    const subcategory = await getSubKat(conn);
    const designer = await getDesigner(conn);
    const bags = await getBag(conn);
    res.render('admin/additems', {
        brands: brands,
        category: category,
        subcategory: subcategory,
        designer: designer,
        bags: bags
    });
});
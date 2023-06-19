import mysql from "mysql";
import path from "path";
import express from "express";
import session from "express-session";
import crypto from "crypto";
import memoryStore from 'memorystore';
import Chart from 'chart.js/auto';
import csvParser from "csv-parser";
import bodyParser from "body-parser";
import multer from "multer";
import fs from 'fs';
import { rejects } from "assert";
import { render_account_publik, follow_transaction} from './account_controller/account.js';
import { render_my_account} from './my_account_controller/myaccount-controller.js';
import { getProductData } from './models/productModel.js'
import { getAccountData } from "./models/accountSearchModel.js";
import productDetailsController from './controllers/product-details_controller.js';
import addReviewController from './controllers/add-review_controller.js';

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
    database: "Review_Tas",
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
app.get("/", async(req,res, next) => {
  try {
    if(req.session.logged_in && req.session.role == 1){
        res.redirect('/dashboard-public');
    }
    else if(req.session.logged_in && req.session.role == 2){
        res.redirect('/dashboard-admin'); //redirect ke dashboard admin
    }
    else{
        const conn = await dbConnect();
        const topten_review = await getTopTenRating(conn);
        res.render("home", { topten_review });
    }
  } catch (err) {
      next(err);
  }
});
  
app.get("/login", async(req,res) => {
    if(req.session.logged_in && req.session == 1){
        res.redirect('/dashboard-public');
    }
    else if(req.session.logged_in && req.session.role == 2){
        res.redirect('/dashboard-admin'); //redirect ke dashboard admin
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
    else if(req.session.logged_in && req.session.role == 2){
        res.redirect('/dashboard-admin'); //redirect ke dashboard admin
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
        res.redirect('/dashboard-admin'); //redirect ke dashboard admin
    }
    else if(req.session.logged_in && req.session.role == 1){
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
app.get('/select-input', async(req, res) => {
    res.render('admin/select-input');
});
//hapus ntar pake ajax
app.get('/additems', async(req, res) => {
    res.render('admin/additems');
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
    const conn = await dbConnect();
    const topten_review = await getTopTenRating(conn);
    res.render("dashboard-public",{
        user: req.session.username,
        topten_review
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
            loginProblem: 'Please insert all the form'
        });
    }
});

app.get("/my-account", checkMiddlewarePublicOnly, render_my_account);
app.get("/account-publik", checkMiddlewarePublicOnly, render_account_publik);
app.post("/follow-person", checkMiddlewarePublicOnly, follow_transaction);
app.post('/logout', checkMiddlewarePublicOnly, async (req, res)=>{
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

// 404 handler
app.use((req, res, next) => {
    res.status(404).render("404", { url: req.originalUrl });
});

export { dbConnect };

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
//dapetin reviewStatistic
const getRevStat = conn => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT K.namaKategori as namaKategori, AVG(R.rateValue) AS averageRating FROM Review R JOIN Tas T ON R.idTas = T.idTas JOIN TasSubKat TS ON T.idTas = TS.idTas JOIN SubKategori SK ON TS.idSubKategori = SK.idSubKategori JOIN Kategori K ON SK.idKategori = K.idKategori GROUP BY K.namaKategori';
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
    res.render('admin/stat', {
        brands: brands,
        category: category,
        subcategory: subcategory
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

app.get('/import', async(req, res) => {
    res.render('admin/import');
});

const csv = csvParser;
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads'); // Change this path according to your requirements
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix);
    }
  });

  
const upload = multer({dest: 'uploads'});

app.post('/import-csv', upload.single('csvFile'), (req, res) => {
  const csvFilePath = req.file.path;
  const results = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', () => {
      console.log('CSV file successfully processed.');
      console.log('Results:', results);
      let table_name = req.body.table_name;
      let values;
      let query;

      if(table_name === 'Designer'){
        query = 'INSERT INTO Designer (idDesigner, namaDesigner) VALUES ?';
        values = results.map((data) => [data.idDesigner, data.namaDesigner]);
      }else if(table_name === 'Kategori'){
        query = 'INSERT INTO Kategori (idKategori, namaKategori) VALUES ?';
        values = results.map((data) => [data.idKategori, data.namaKategori]);
      }else if(table_name === 'Merk'){
        query = 'INSERT INTO Merk (idMerk, namaMerk) VALUES ?';
        values = results.map((data) => [data.idMerk, data.namaMerk]);
      }else if(table_name === 'Tas'){
        query = 'INSERT INTO Tas (namaTas, deskripsi, warna, panjang, lebar, tinggi, foto, idMerk, idDesigner) VALUES ?';
        values = results.map((data) => [data.namaTas, data.deskripsi, data.warna, data.panjang, data.lebar, data.tinggi, data,foto, data.idMerk, data.idDesigner]);
      }else if(table_name === 'SubCategory'){
        query = 'INSERT INTO SubKategori (idSubKategori, idKategori, namaSubKategori) VALUES ?';
        values = results.map((data) => [data.idSubKategori, data.idKategori, data.namaSubKategori]);
      }

      console.log('Inserting values:', values);

      pool.query(query, [values], (error, results, fields) => {
        if (error) {
          console.error('Error inserting data into the database:', error);
          res.status(500).send('Error inserting data into the database');
        } else {
          if (results.affectedRows > 0) {
            // Data inserted successfully
            console.log('Data inserted into the database:', results);
            res.send('File uploaded and data inserted into the database.');
          } else {
            // No rows were affected (data not inserted)
            console.log('No rows were affected. Data not inserted.');
            res.send('File uploaded but data not inserted into the database.');
          }
        }
      });      
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
      res.status(500).send('Error reading CSV file');
    });
});

app.post('/stat', async(req, res) => {
    // const conn = await dbConnect();
    // const brands = await getBrands(conn);
    // const category = await getKategori(conn);
    // const subcategory = await getSubKat(conn);
    // const review = await getReview(conn);
    // const query = `SELECT K.namaKategori as namaKategori, AVG(R.rateValue) AS averageRating FROM Review R JOIN Tas T ON R.idTas = T.idTas JOIN TasSubKat TS ON T.idTas = TS.idTas JOIN SubKategori SK ON TS.idSubKategori = SK.idSubKategori JOIN Kategori K ON SK.idKategori = K.idKategori GROUP BY K.namaKategori`;
    // conn.query(query, (err, result) => {
    //     if(err){
    //         console.error(`error ey`, err);
    //         res.sendStatus(500);
    //         // return;
    //     }
    //     // console.log(result);
    //     // res.json(result);
    // })
    const category = req.body.category;
    const subcategory = req.body.subcategory;

    console.log(category);
    console.log(subcategory);

    // const query = `SELECT K.namaKategori, AVG(R.rateValue) as rateValue
    // FROM tas AS T
    // JOIN tassubkat AS TS ON T.idTas = TS.idTas
    // JOIN subkategori AS SK ON TS.idSubkategori = SK.idSubkategori
    // JOIN kategori AS K ON SK.idKategori = K.idKategori
    // JOIN merk AS M ON T.idMerk = M.idMerk
    // JOIN review AS R ON T.idTas = R.idTas
    // WHERE M.namaMerk = '${brand}' AND K.namaKategori = '${category}' AND SK.namaSubKategori = '${subcategory}'
    // GROUP BY T.idTas`;

    const query = `
    SELECT M.namaMerk, AVG(R.rateValue) as rateValue
    FROM tas AS T
    JOIN tassubkat AS TS ON T.idTas = TS.idTas
    JOIN subkategori AS SK ON TS.idSubkategori = SK.idSubkategori
    JOIN kategori AS K ON SK.idKategori = K.idKategori
    JOIN merk AS M ON T.idMerk = M.idMerk
    JOIN review AS R ON T.idTas = R.idTas
    WHERE K.namaKategori = '${category}' AND SK.namaSubKategori = '${subcategory}'
    GROUP BY T.idTas, M.namaMerk
    `;

    pool.query(query, (err, result) => {
        if(err){
            console.log('error', err);
        }
        console.log(result);
        let brands = [];
        let avgValue = [];
        for(let i = 0; i < result.length; i++){
            brands[i] = result[i].namaMerk;
            avgValue[i] = result[i].rateValue;
        }
        console.log(avgValue);
        console.log(brands);
        res.send({brands, avgValue, url:'/stat', status: 'success'})
        
    })
});
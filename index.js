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
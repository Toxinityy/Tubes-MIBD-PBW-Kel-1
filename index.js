import mysql from "mysql";
import path from "path";
import express from "express";
import session from "express-session";
import crypto from "crypto";
import memoryStore from "memorystore";
import { getProductData } from "./models/productModel.js";
import { getAccountData } from "./models/accountSearchModel.js";

// Test
// import { AppAdmin } from "./admin/app.js";

const PORT = 8080;
const app = express();
const sessionStore = memoryStore(session);
app.use(
  session({
    cookie: {
      httpOnly: false,
      sameSite: "strict",
      maxAge: 1 * 60 * 60 * 1000,
    },
    store: new sessionStore({
      checkPeriod: 1 * 60 * 60 * 1000,
    }),
    secret: "my_secret",
    resave: true,
    saveUninitialized: true,
    logged_in: false,
  })
);
const pool = mysql.createPool({
  user: "root",
  password: "",
  database: "review_tas",
  host: "localhost",
});

// app.set('views', path.join(__dirname, 'views'));
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

const checkEmail = (conn, email) => {
  return new Promise((resolve, reject) => {
    conn.query(
      "SELECT * FROM Publik WHERE emailPengguna = ?",
      [email],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const checkUsername = (conn, username) => {
  return new Promise((resolve, reject) => {
    conn.query(
      "SELECT * FROM Publik WHERE username = ?",
      [username],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const insertData = (conn, firstName, lastName, username, email, password) => {
  return new Promise((resolve, reject) => {
    const date = new Date();
    conn.query(
      "INSERT INTO Publik (password, username, firstName, lastName, emailPengguna, accountCreatedDate) VALUES (?, ?, ?, ?, ?, ?)",
      [password, username, firstName, lastName, email, date],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

app.get("/", async (req, res) => {
  // const conn = await dbConnect();
  if (req.session.logged_in) {
    res.redirect("/dashboard-public");
  } else {
    res.render("home");
  }
});
app.get("/login", async (req, res) => {
  if (req.session.logged_in) {
    res.redirect("/dashboard-public");
  } else {
    res.render("login-public", {
      emailProblem: "",
      passwordProblem: "",
      loginProblem: "",
    });
  }
});
app.get("/signup", async (req, res) => {
  if (req.session.logged_in) {
    res.redirect("/dashboard-public");
  } else {
    res.render("signup", {
      emailProblem: "",
      usernameProblem: "",
      passwordProblem: "",
      signupProblem: "",
    });
  }
});
app.get("/adminlogin", async (req, res) => {
  res.render("login-admin");
});
app.get("/dashboard-public", async (req, res) => {
  res.render("dashboard-public", {
    user: req.session.username,
  });
});
app.post("/signup", async (req, res) => {
  // terima nama, email, pass, confirm pass
  const { firstName, lastName, email, username, password, confirmpassword } =
    req.body;

  // cek form kosong
  if (
    firstName != "" &&
    lastName != "" &&
    email != "" &&
    username != "" &&
    password != "" &&
    confirmpassword != ""
  ) {
    // validasi database
    const signedUpEmail = await checkEmail(await dbConnect(), email);
    const signedUpUsername = await checkUsername(await dbConnect(), username);
    // belum ada pengguna dengan email tersebut
    if (signedUpEmail.length == 0 && signedUpUsername.length == 0) {
      //cek password match
      if (password == confirmpassword) {
        // jika match
        // insert database
        insertData(
          await dbConnect(),
          firstName,
          lastName,
          username,
          email,
          password
        ).then(async (result) => {
          const signedUpData = await checkEmail(await dbConnect(), email);
          req.session.logged_in = true;
          req.session.username = signedUpData[0].username;
          req.session.idPengguna = signedUpData[0].idPengguna;
          req.session.namaLengkap =
            signedUpData[0].firstName + " " + signedUpData[0].lastName;
          // redirect ke dashboard public
          res.redirect("/dashboard-public");
        });
      } else {
        // jika tidak match
        // pesan kesalahan
        res.render("signup", {
          emailProblem: "",
          usernameProblem: "",
          passwordProblem: "Password does not match",
          signupProblem: "",
        });
      }
    } else if (signedUpEmail.length != 0 && signedUpUsername.length == 0) {
      //sudah ada pengguna dengan email tersebut
      res.render("signup", {
        emailProblem: "Email already registered",
        usernameProblem: "",
        passwordProblem: "",
        signupProblem: "",
      });
    } else if (signedUpEmail.length == 0 && signedUpUsername.length != 0) {
      //sudah ada pengguna dengan username tersebut
      res.render("signup", {
        emailProblem: "",
        usernameProblem: "Username already exists",
        passwordProblem: "",
        signupProblem: "",
      });
    } else {
      res.render("signup", {
        emailProblem: "Email already registered",
        usernameProblem: "Username already exists",
        passwordProblem: "",
        signupProblem: "",
      });
    }
  } else {
    // pesan kesalahan
    res.render("signup", {
      emailProblem: "",
      usernameProblem: "",
      passwordProblem: "",
      signupProblem: "Please insert all fields",
    });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (email != "" && password != "") {
    const signedUpEmail = await checkEmail(await dbConnect(), email);
    if (signedUpEmail.length == 0) {
      //email belum terdaftar
      res.render("login-public", {
        emailProblem: "Email does not exists",
        passwordProblem: "",
        loginProblem: "",
      });
    } else {
      const registeredPassword = signedUpEmail[0].password;
      if (registeredPassword == password) {
        //jika pass sesuai maka login berhasil
        req.session.logged_in = true;
        req.session.username = signedUpEmail[0].username;
        req.session.idPengguna = signedUpEmail[0].idPengguna;
        req.session.namaLengkap =
          signedUpEmail[0].firstName + " " + signedUpEmail[0].lastName;
        res.redirect("/dashboard-public");
      } else {
        //jika tidak maka tetap di halaman login
        res.render("login-public", {
          emailProblem: "",
          passwordProblem: "Wrong password",
          loginProblem: "",
        });
      }
    }
  } else {
    res.render("login-public", {
      emailProblem: "",
      passwordProblem: "",
      loginProblem: "Please insert all fields",
    });
  }
});

app.get("/account-publik", async (req, res) => {
  res.render("account-publik", {
    user: req.session.username,
  });
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

    const products = await getProductData(
      conn,
      searchParams,
      selectedBrand,
      selectedCategory
    );
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    const accounts = await getAccountData(conn, searchParams);

    const paginatedProducts = [];
    const start = (page - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, products.length);

    for (let i = start; i < end; i++) {
      paginatedProducts.push(products[i]);
    }

    res.render("filter", {
      user: req.session.username,
      brands,
      categories,
      // subCategories,
      products: paginatedProducts,
      accounts,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { message: "Internal Server Error" });
  }
});

// Admin
app.get("/input", async (req, res) => {
  try {
    res.status(200).render("input");
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
});

app.post("/submit", async (req, res) => {
  try {
    const selectedPage = req.body.page;

    if (selectedPage === "minReview") {
      res.status(200).render("minReview");
    } else if (selectedPage === "category") {
      res.status(200).redirect("/setCategory");
    } else if (selectedPage === "subCategory") {
      res.status(200).render("subCategory");
    } else if (selectedPage === "import") {
      res.status(200).render("import");
    } else {
      res.status(200).render("input");
      // res.render("/input"); // Jika pilihan tidak valid, kembali ke halaman input
    }
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
});

// AdminFunc
const getData = (conn, columnQ, tableDB, whereQ, customQ) => {
  return new Promise((resolve, reject) => {
    // const query = `SELECT * FROM kategori WHERE idKategori = ${customQ}`;
    const query = `SELECT ${columnQ} FROM ${tableDB} ${
      whereQ ? `WHERE ${whereQ} = ${customQ}` : ``
    }`;
    conn.query(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        const data = [];
        for (let row of result) {
          data.push(row);
        }
        resolve(data);
      }
    });
  });
};

//CAT & SUBCAT
app.get("/setCategory", async (req, res) => {
  try {
    const conn = await dbConnect();
    const categories = await getData(conn, "*", "kategori");

    res.status(200).render("category", {
      categories,
    });
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
});

// Menangani submit set sub category
app.post("/setCategory", async (req, res) => {
  try {
    const { category, newCategory } = req.body;
    const subCatQ = category ? category : newCategory;

    // Mendapatkan daftar sub-kategori dari database berdasarkan kategori yang dipilih sebelumnya (misalnya menggunakan query SQL SELECT)
    const conn = await dbConnect();
    const subCategories = newCategory
      ? undefined
      : await getData(conn, "*", "subkategori", "idKategori", category);

    // Menyimpan ke database
    if (newCategory) {
      const insertCategoryQuery =
        "INSERT INTO Kategori (namaKategori) VALUES (?)";

      pool.query(insertCategoryQuery, [newCategory], function (err, result) {
        if (err) throw err;
        console.log(newCategory);
        res.status(200).render("subCategory", {
          subCatQ: subCatQ,
          subCategories: subCategories,
        });
      });
    } else {
      res.status(200).render("subCategory", {
        subCatQ: subCatQ,
        subCategories: subCategories,
      });
    }

    // console.log(subCategories)
    // res.status(200).send("subCategories")
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
});

// Menangani submit Set Sub-Category
app.post("/setSubCategory", async (req, res) => {
  try {
    const { subCategory } = req.body;
    const newSubCategories = [];

    // Memproses sub-kategori yang dipilih
    if (subCategory) {
      // Lakukan sesuatu dengan sub-kategori yang dipilih (misalnya, menyimpannya ke database)
      const insertQuery =
        "INSERT INTO SubKategori (namaSubKategori) VALUES (?)";
      pool.query(insertQuery, [subCategory], function (err, results) {
        if (err) {
          console.log("Error inserting sub-category:", err);
        } else {
          console.log("Sub-category inserted successfully");
        }
      });
    }

    // Memproses sub-kategori baru
    for (const key in req.body) {
      if (key.startsWith("newSubCategory_")) {
        const newSubCategory = req.body[key];
        newSubCategories.push(newSubCategory);

        // Lakukan sesuatu dengan sub-kategori baru (misalnya, menyimpannya ke database)
        const insertQuery =
          "INSERT INTO SubKategori (namaSubKategori) VALUES (?)";
        pool.query(
          insertQuery,
          [newSubCategory],
          function (err, results) {
            if (err) {
              console.log("Error inserting new sub-category:", err);
            } else {
              console.log("New sub-category inserted successfully");
            }
          }
        );
      }
    }

    // console.log(subCategory);

    // res.status(200).send("subCategories");
    res.redirect("/input");
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
});

app.get("/import", async (req, res) => {
  try {
    res.render("import");
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
});

export { dbConnect };

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}!`);
});

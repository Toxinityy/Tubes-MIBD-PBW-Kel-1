import mysql from "mysql";
import path from "path";
import express from "express";
import session from "express-session";
import crypto from "crypto";

const PORT = 8080;
const app = express();

app.use(
    session({
        secret: "my_secret",
        resave: true,
        saveUninitialized: true,
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

app.get("/", async(req,res) => {
    // const conn = await dbConnect();
    res.render("home");
});
app.get("/login", async(req,res) => {
    res.render("login-public");
});
app.get("/signup", async(req,res) => {
    res.render("signup");
});


app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}!`);
});
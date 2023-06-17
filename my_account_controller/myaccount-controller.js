import mysql from "mysql";
const pool = mysql.createPool({
    user: "root",
    password: "",
    database: "IDE",
    host: "localhost",
});

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

const getFollowing = (conn, idPengguna)=>{
    return new Promise((resolve, reject)=>{
        conn.query('SELECT COUNT(Publik.id) AS \'Following\' FROM Publik INNER JOIN Teman ON Publik.id = Teman.idFollow WHERE Publik.id = ?', [idPengguna],(err, result)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        });
    });
};

const getFollowingList = (conn, idPengguna)=>{
    return new Promise((resolve, reject)=>{
        conn.query('SELECT Teman.idFollowing, Following.username, Following.fotoProfile FROM Publik AS Me INNER JOIN Teman ON Me.id = Teman.idFollow INNER JOIN Publik AS Following ON Following.id = Teman.idFollowing WHERE Me.id = ?', [idPengguna],(err, result)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        });
    });
};

const getFollowers = (conn, idPengguna)=>{
    return new Promise((resolve, reject)=>{
        conn.query('SELECT COUNT(Publik.id) AS \'Followers\' FROM Publik INNER JOIN Teman ON Publik.id = Teman.idFollowing WHERE Publik.id = ?', [idPengguna],(err, result)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        });
    });
};

const getFollowerList = (conn, idPengguna)=>{
    return new Promise((resolve, reject)=>{
        conn.query('SELECT Teman.idFollow, Follower.username, Follower.fotoProfile FROM Publik AS Me INNER JOIN Teman ON Me.id = Teman.idFollowing INNER JOIN Publik AS Follower ON Follower.id = Teman.idFollow WHERE Me.id = ?', [idPengguna],(err, result)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        });
    });
};

const getReview = (conn, idPengguna)=>{
    return new Promise((resolve, reject)=>{
        conn.query('SELECT DISTINCT(Review.idReview), Review.currentDate, Tas.foto, Tas.idTas, Review.rateValue, Review.reviewDescription, Tas.namaTas, Kategori.namaKategori FROM Review INNER JOIN Tas ON Review.idTas = Tas.idTas INNER JOIN TasSubKat ON Tas.idTas = TasSubKat.idTas INNER JOIN Subkategori ON TasSubKat.idSubKategori = Subkategori.idSubKategori INNER JOIN Kategori ON subkategori.idKategori = Kategori.idKategori WHERE Review.id = ? ORDER BY Review.currentDate DESC', [idPengguna], (err, result)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        });
    });
};

const getFotoProfil = (conn, idPengguna)=>{
    return new Promise((resolve, reject)=>{
        conn.query('SELECT Publik.fotoProfile FROM Publik WHERE Publik.id = ?', [idPengguna], (err, result)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        });
    });
};


export async function render_my_account(req, res) {
    const following = await getFollowing(await dbConnect(), req.session.idPengguna);
    const followers = await getFollowers(await dbConnect(), req.session.idPengguna);
    const dataReview = await getReview(await dbConnect(), req.session.idPengguna);
    const followerList = await getFollowerList(await dbConnect(), req.session.idPengguna);
    const followingList = await getFollowingList(await dbConnect(), req.session.idPengguna);
    const fotoProfile = await getFotoProfil(await dbConnect(), req.session.idPengguna);

    res.render('my-account',{
        foto: fotoProfile[0].fotoProfile,
        user: req.session.username,
        followersnum: followers[0].Followers,
        followingnum: following[0].Following,
        reviews: dataReview,
        followerList: followerList,
        followingList: followingList
    });
}
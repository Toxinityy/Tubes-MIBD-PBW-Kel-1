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

const getUsername = (conn, idPengguna)=>{
    return new Promise((resolve, reject)=>{
        conn.query('SELECT Publik.username FROM Publik WHERE Publik.id = ?', [idPengguna], (err, result)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        });
    });
};

const isFollowed = (conn, idPengguna1, idPengguna2)=>{
    return new Promise((resolve, reject)=>{
        conn.query('SELECT * FROM Teman WHERE Teman.idFollow = ? AND Teman.idFollowing = ?', [idPengguna1, idPengguna2], (err, result)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        });
    });
};

export async function render_account_publik(req, res) {
    const idPengguna = req.query.id;
    const idSaya = req.session.idPengguna;

    const username = await getUsername(await dbConnect(), idPengguna);
    const following = await getFollowing(await dbConnect(), idPengguna);
    const followers = await getFollowers(await dbConnect(), idPengguna);
    const dataReview = await getReview(await dbConnect(), idPengguna);
    const followerList = await getFollowerList(await dbConnect(), idPengguna);
    const followingList = await getFollowingList(await dbConnect(), idPengguna);
    const fotoProfile = await getFotoProfil(await dbConnect(), idPengguna);

    let status = '';
    let textFollow = '';

    const followData = await isFollowed(await dbConnect(), idSaya, idPengguna);
    if(followData.length==0){
        status = 'not-followed';
        textFollow = 'Follow';
    }
    else{
        status = 'followed';
        textFollow = 'Followed';
    }

    res.render('account-publik',{
        user: req.session.username,
        foto: fotoProfile[0].fotoProfile,
        username: username[0].username,
        followersnum: followers[0].Followers,
        followingsnum: following[0].Following,
        statusFollow: status,
        followText: textFollow,
        reviews: dataReview,
        followerList: followerList,
        followingList: followingList
    });
}
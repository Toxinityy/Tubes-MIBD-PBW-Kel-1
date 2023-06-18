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

const getProfilData = (conn, idPengguna)=>{
    return new Promise((resolve, reject)=>{
        conn.query('SELECT * FROM Publik WHERE Publik.id = ?', [idPengguna], (err, result)=>{
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

const doFollow = (conn, idPengguna1, idPengguna2)=>{
    return new Promise((resolve, reject)=>{
        conn.query('INSERT INTO Teman (idFollow, idFollowing) VALUES (?, ?)', [idPengguna1, idPengguna2], (err, result)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        });
    });
};

const undoFollow = (conn, idPengguna1, idPengguna2)=>{
    return new Promise((resolve, reject)=>{
        conn.query('DELETE FROM Teman WHERE Teman.idFollow = ? AND Teman.idFollowing = ?', [idPengguna1, idPengguna2], (err, result)=>{
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
    res.setHeader('Cache-Control', 'no-store');
    const idPengguna = req.query.id;
    const idSaya = req.session.idPengguna;
    if(idPengguna==idSaya){
        res.redirect('my-account');
    }else{
        const con = await dbConnect();
        
        const dataProfil = await getProfilData(con, idPengguna);
        const following = await getFollowing(con, idPengguna);
        const followers = await getFollowers(con, idPengguna);
        const dataReview = await getReview(con, idPengguna);
        const followerList = await getFollowerList(con, idPengguna);
        const followingList = await getFollowingList(con, idPengguna);

        let status = '';
        let textFollow = '';

        const followData = await isFollowed(con, idSaya, idPengguna);
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
            foto: dataProfil[0].fotoProfile,
            username: dataProfil[0].username,
            followersnum: followers[0].Followers,
            followingsnum: following[0].Following,
            statusFollow: status,
            followText: textFollow,
            userId: dataProfil[0].id,
            reviews: dataReview,
            followerList: followerList,
            followingList: followingList,
        });
    }
}



export async function follow_transaction(req, res){
    const idPengguna = req.body.idUser;
    const idSaya = req.session.idPengguna;
    const followStatus = await isFollowed(await dbConnect(), idSaya, idPengguna);
    if(followStatus.length==0){
        await doFollow(await dbConnect(), idSaya, idPengguna);
    }
    else{
        await undoFollow(await dbConnect(), idSaya, idPengguna);
    }
    res.redirect(`/account-publik?id=${idPengguna}`);
}

// models/productDetailsModel.js

const getProductDetails = async (conn, productId) => {
  return new Promise((resolve, reject) => {
    // console.log({productId})
    let query = "SELECT * FROM TasDetailed";
    if (productId) {
      query += ` WHERE idTas = '${productId}'`;
    } else {
      reject(new Error("No product ID provided"));
      return;
    }

    if (!conn || typeof conn.query !== "function") {
      reject(new Error("Invalid connection object"));
      return;
    }

    // console.log(query);
    conn.query(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const getSubCategories = async (conn, productId) => {
  return new Promise((resolve, reject) => {
    let query = "SELECT Tas.idTas, SubKat.idSubKategori, Subkat.namaSubKategori ";
    query += "FROM Tas JOIN TasSubKat ON Tas.idTas = TasSubKat.idTas ";
    query += "JOIN SubKategori AS SubKat ON TasSubkat.idSubKategori = SubKat.idSubKategori ";
    if (productId) {
      query += ` WHERE Tas.idTas = '${productId}'`;
    } else {
      reject(new Error("No product ID provided"));
      return;
    }

    if (!conn || typeof conn.query !== "function") {
      reject(new Error("Invalid connection object"));
      return;
    }

    // console.log(query);
    conn.query(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const getReview = async (conn, productId) => {
    return new Promise((resolve, reject) => {
      let query = "SELECT Review.*, Publik.username, Publik.fotoProfile ";
      query += "FROM Review JOIN Publik ON Review.id = Publik.id ";
      if (productId) {
        query += `WHERE idTas = ${productId}`;
      } else {
        reject(new Error("No product ID provided"));
        return;
      }
  
      if (!conn || typeof conn.query !== "function") {
        reject(new Error("Invalid connection object"));
        return;
      }
  
      // console.log(query);
      conn.query(query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };

const addReview = async (conn, productId, rating, reviews, username) => {
  return new Promise((resolve, reject) => {
    let query = "INSERT INTO Review(rateValue, reviewDescription, idTas, id, currentDate) ";
    query += `VALUES (${rating}, '${reviews}', ${productId}, (SELECT id FROM Publik WHERE username = '${username}'), CURDATE())`;
    console.log(query);

    if (!conn || typeof conn.query !== "function") {
      reject(new Error("Invalid connection object"));
      return;
    }

    // console.log(query);
    conn.query(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

export { getProductDetails, getSubCategories, getReview, addReview };

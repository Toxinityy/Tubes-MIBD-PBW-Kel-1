// models/productModel.js

const getProductData = async (conn, searchParams, brand, category) => {
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM TasDetailed';
    const params = [];

    if (searchParams) {
      query += ` WHERE namaTas LIKE '%${searchParams}%'`;
    }

    if (brand) {
      if (searchParams) {
        query += ' AND';
      } else {
        query += ' WHERE';
      }
      query += ' namaMerk LIKE ?';
      params.push(`%${brand}%`);
    }

    if (category) {
      if (searchParams || brand) {
        query += ' AND';
      } else {
        query += ' WHERE';
      }
      query += ' namaKategori LIKE ?';
      params.push(`%${category}%`);
    }

    conn.query(query, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        const products = [];
        for (let row of result) {
          products.push(row);
        }
        resolve(products);
      }
    });
  });
};

export { getProductData };

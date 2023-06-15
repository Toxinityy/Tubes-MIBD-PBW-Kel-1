// models/productModel.js

const getProductData = async (conn) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM tas';
        conn.query(query, (err, result) => {
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

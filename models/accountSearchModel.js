// models/accountSearchModel.js

const getAccountData = async (conn, searchParams) => {
    return new Promise((resolve, reject) => {
        let query = 'SELECT * FROM Publik';
        if (searchParams) {
            query += ` WHERE firstName LIKE '%${searchParams}%' OR lastName LIKE '%${searchParams}%'`;
        }
        conn.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                const accounts = [];
                for (let row of result) {
                    accounts.push(row);
                }
                resolve(accounts);
            }
        });
    });
};

export { getAccountData };

const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const mysql = require('mysql');
const csv = require('csv-parser');
const fs = require('fs');

// Menggunakan EJS sebagai view engine
app.set('view engine', 'ejs');

// Konfigurasi koneksi database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'database'
});

// Membuka koneksi ke database
connection.connect(function(err) {
  if (err) {
    console.error('Koneksi database gagal: ' + err.stack);
    return;
  }
  console.log('Terhubung ke database dengan ID ' + connection.threadId);
});

// Middleware untuk parsing body pada POST request
app.use(express.urlencoded({ extended: false }));


// INPUT
app.get('/input', function(req, res) {
  res.render('input');
});

app.post('/submit', function(req, res) {
  const selectedPage = req.body.page;

  if (selectedPage === 'minReview') {
    res.redirect('/setMinimumReview');
  } else if (selectedPage === 'category') {
    res.redirect('/setCategory');
  } else if (selectedPage === 'subCategory') {
    res.redirect('/setSubCategory');
  } else if (selectedPage === 'import') {
    res.redirect('/import');
  } else {
    res.redirect('/input'); // Jika pilihan tidak valid, kembali ke halaman input
  }
});


//minREVIEW
// Menampilkan halaman set minimum review
app.get('/setMinimumReview', function(req, res) {
    res.render('minimumReview');
  });
  
  // Menangani submit set minimum review
  app.post('/setMinimumReview', function(req, res) {
    const minimumReview = req.body.minimumReview;
  
    // Lakukan sesuatu dengan nilai minimum review, misalnya menyimpannya ke database
  
    res.redirect('/setMinimumReview?success=true');
  });
  
  // Menampilkan pesan success
  app.get('/setMinimumReview', function(req, res) {
    const success = req.query.success;
    let message = '';
  
    if (success === 'true') {
      message = 'Input data success';
    }
  
    res.render('minimumReview', { message: message });
  });

// CAT
// Menampilkan halaman set category
app.get('/setCategory', function(req, res) {
  const categoriesQuery = 'SELECT * FROM Kategori';

  connection.query(categoriesQuery, function(err, categories) {
    if (err) throw err;
    res.render('setCategory', { categories: categories, allowNewCategory: true });
  });
});

// Menangani submit set sub category
app.post('/setCategory', function(req, res) {
  const category = req.body.category;
  const newCategory = req.body.newCategory;

  // Menyimpan ke database
  if (newCategory) {
    const insertCategoryQuery = 'INSERT INTO Kategori (namaKategori) VALUES (?)';

    connection.query(insertCategoryQuery, [newCategory], function(err, result) {
      if (err) throw err;
      res.redirect('/setCategory');
    });
  } else {
    res.redirect('/setCategory');
  }
});

// SUB CAT
// Menampilkan halaman Set Sub-Category
app.get('/setSubCategory', function(req, res) {
  // Mendapatkan daftar sub-kategori dari database berdasarkan kategori yang dipilih sebelumnya (misalnya menggunakan query SQL SELECT)
  const subCategories = [
    { idSubKategori: 1, namaSubKategori: 'Sub-Category 1' },
    { idSubKategori: 2, namaSubKategori: 'Sub-Category 2' },
    { idSubKategori: 3, namaSubKategori: 'Sub-Category 3' }
  ];

  res.render('setSubCategory', { subCategories: subCategories });
});

// Menangani submit Set Sub-Category
app.post('/setSubCategory', function(req, res) {
  const subCategory = req.body.subCategory;
  const newSubCategories = [];

  // Memproses sub-kategori yang dipilih
  if (subCategory) {
    // Lakukan sesuatu dengan sub-kategori yang dipilih (misalnya, menyimpannya ke database)
    const insertQuery = 'INSERT INTO SubKategori (namaSubKategori) VALUES (?)';
    connection.query(insertQuery, [subCategory], function(err, results) {
      if (err) {
        console.log('Error inserting sub-category:', err);
      } else {
        console.log('Sub-category inserted successfully');
      }
    });
  }

  // Memproses sub-kategori baru
  for (const key in req.body) {
    if (key.startsWith('newSubCategory_')) {
      const newSubCategory = req.body[key];
      newSubCategories.push(newSubCategory);

      // Lakukan sesuatu dengan sub-kategori baru (misalnya, menyimpannya ke database)
      const insertQuery = 'INSERT INTO SubKategori (namaSubKategori) VALUES (?)';
      connection.query(insertQuery, [newSubCategory], function(err, results) {
        if (err) {
          console.log('Error inserting new sub-category:', err);
        } else {
          console.log('New sub-category inserted successfully');
        }
      });
    }
  }

  res.redirect('/setSubCategory');
});

// IMPORT
// Menampilkan halaman import
app.get('/import', function(req, res) {
  res.render('import');
});

// submit import
app.post('/import', function(req, res) {
  // Cek apakah file database diupload
  if (req.files && req.files.databaseFile) {
    const databaseFile = req.files.databaseFile;

    // Simpan file database ke dalam database.sql
    databaseFile.mv('database.sql', function(err) {
      if (err) {
        console.log('Error saving database file:', err);
      } else {
        console.log('Database file saved successfully');
      }
    });
  }

  // Cek apakah file CSV diupload
  if (req.files && req.files.csvFile) {
    const csvFile = req.files.csvFile;

    // Memproses data dari file CSV dan menyimpannya ke database
    const results = [];

    fs.createReadStream(csvFile.tempFilePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', () => {
        // Menyimpan data ke database
        for (const row of results) {
          // Menyimpan data ke tabel Kategori
          const insertKategoriQuery = 'INSERT INTO Kategori (namaKategori) VALUES (?)';
          connection.query(insertKategoriQuery, [row.namaKategori], function(err, results) {
            if (err) {
              console.log('Error inserting data into Kategori table:', err);
            } else {
              console.log('Data inserted into Kategori table successfully');
            }
          });

          // Menyimpan data ke tabel subKategori
          const insertSubKategoriQuery = 'INSERT INTO SubKategori (namaSubKategori) VALUES (?)';
          connection.query(insertSubKategoriQuery, [row.namaSubKategori], function(err, results) {
            if (err) {
              console.log('Error inserting data into SubKategori table:', err);
            } else {
              console.log('Data inserted into SubKategori table successfully');
            }
          });

          // Menyimpan data ke tabel Merk
          const insertMerkQuery = 'INSERT INTO Merk (namaMerk) VALUES (?)';
          connection.query(insertMerkQuery, [row.namaMerk], function(err, results) {
            if (err) {
              console.log('Error inserting data into Merk table:', err);
            } else {
              console.log('Data inserted into Merk table successfully');
            }
          });

          // Menyimpan data ke tabel Designer
          const insertDesignerQuery = 'INSERT INTO Designer (namaDesigner) VALUES (?)';
          connection.query(insertDesignerQuery, [row.namaDesigner], function(err, results) {
            if (err) {
              console.log('Error inserting data into Designer table:', err);
            } else {
              console.log('Data inserted into Designer table successfully');
            }
          });

          // Menyimpan data ke tabel Tas
          const insertTasQuery = 'INSERT INTO Tas (warna, panjang, lebar, tinggi, foto) VALUES (?, ?, ?, ?, ?)';
          connection.query(insertTasQuery, [row.warna, row.panjang, row.lebar, row.tinggi, row.foto], function(err, results) {
            if (err) {
              console.log('Error inserting data into Tas table:', err);
            } else {
              console.log('Data inserted into Tas table successfully');
            }
          });
        }
      });
  }

  res.redirect('/import');
});


// Menjalankan server
app.listen(8080, function() {
  console.log('Server berjalan di http://localhost:8080');
});
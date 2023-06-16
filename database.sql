-- Membuat database
-- CREATE DATABASE Review_Tas;

USE Review_Tas;

-- Tabel Kategori
CREATE TABLE Kategori (
  idKategori INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  namaKategori VARCHAR(250)
);

-- Tabel Sub-Kategori
CREATE TABLE SubKategori (
  idSubKategori INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  idKategori INT,
  namaSubKategori VARCHAR(250),
  FOREIGN KEY (idKategori) REFERENCES Kategori(idKategori)
);

-- Tabel Merk
CREATE TABLE Merk (
  idMerk INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  namaMerk VARCHAR(250)
);

-- Tabel Publik
CREATE TABLE Publik (
  id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  password VARCHAR(150),
  username VARCHAR(250),
  firstName VARCHAR(250),
  lastName VARCHAR(250),
  emailPengguna VARCHAR(150),
  accountCreatedDate DATE,
  fotoProfile BLOB
);

-- Tabel Admin
CREATE TABLE Admin (
  id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  password VARCHAR(150),
  username VARCHAR(250),
  firstName VARCHAR(250),
  lastName VARCHAR(250),
  emailPengguna VARCHAR(150),
  accountCreatedDate DATE
);

-- Tabel Tas
CREATE TABLE Tas (
  idTas INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  namaTas VARCHAR(250),
  warna VARCHAR(100),
  panjang INT,
  lebar INT,
  tinggi INT,
  foto LONGBLOB,
  idMerk INT,
  idSubKategori INT,
  FOREIGN KEY (idMerk) REFERENCES Merk(idMerk),
  FOREIGN KEY (idSubKategori) REFERENCES SubKategori(idSubKategori)
);

-- Tabel Designer
CREATE TABLE Designer (
  idDesigner INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  namaDesigner VARCHAR(250)
);

-- Tabel Design
CREATE TABLE Design (
  idDesign INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  idDesigner INT,
  idTas INT,
  FOREIGN KEY (idDesigner) REFERENCES Designer(idDesigner),
  FOREIGN KEY (idTas) REFERENCES Tas(idTas)
);

-- Tabel Review
CREATE TABLE Review (
  idReview INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  rateValue INT,
  reviewDescription TEXT,
  idTas INT,
  id INT,
  FOREIGN KEY (idTas) REFERENCES Tas(idTas),
  FOREIGN KEY (id) REFERENCES Publik(id)
);

-- Tabel Teman
CREATE TABLE Teman (
  idFollow INT NOT NULL,
  idFollowing INT NOT NULL,
  FOREIGN KEY (idFollow) REFERENCES Publik(id),
  FOREIGN KEY (idFollowing) REFERENCES Publik(id)
);

-- Query
-- INSERT INTO Kategori(idKategori, namaKategori)
-- VALUES ('1', 'Backpack')

-- INSERT INTO SubKategori(idSubKategori, idKategori, namaSubKategori)
-- VALUES ('1', 'Travel')
-- INSERT INTO SubKategori(idSubKategori, idKategori, namaSubKategori)
-- VALUES ('2', 'Camping')

-- INSERT INTO Merk(idMerk, namaMerk)
-- VALUES ('1', 'Eiger')

-- INSERT INTO Tas(idTas, namaTas, warna, panjang, lebar, tinggi, foto)
-- VALUES ('1', 'Travel Adventure Backpack', 'Green Army', '20', '10','43', NULL)

-- Insert data ke Kategori
INSERT INTO Kategori (namaKategori) VALUES
('Handbags'),
('Backpacks'),
('Tote Bags');

-- IInsert data ke SubKategori
INSERT INTO SubKategori (idKategori, namaSubKategori) VALUES
(1, 'Clutches'),
(1, 'Crossbody Bags'),
(2, 'Laptop Backpacks'),
(2, 'Travel Backpacks'),
(3, 'Canvas Totes'),
(3, 'Leather Totes');

-- Insert data ke Merk
INSERT INTO Merk (namaMerk) VALUES
('Gucci'),
('Louis Vuitton'),
('Prada'),
('Chanel');

-- Insert data ke Publik
INSERT INTO Publik (password, username, firstName, lastName, emailPengguna, accountCreatedDate) VALUES
('password123', 'user1', 'John', 'Doe', 'john.doe@example.com', '2023-01-15'),
('password456', 'user2', 'Jane', 'Smith', 'jane.smith@example.com', '2023-02-20');

-- Insert data ke Admin
INSERT INTO Admin (password, username, firstName, lastName, emailPengguna, accountCreatedDate) VALUES
('adminpass', 'admin1', 'Admin', 'User', 'admin@example.com', '2023-01-01');

-- Insert data ke Tas
INSERT INTO Tas (namaTas, warna, panjang, lebar, tinggi, idMerk, idSubKategori) VALUES
('Classic Clutch', 'Black', 25, 10, 15, 1, 1),
('Leather Crossbody', 'Brown', 30, 12, 20, 2, 2),
('Laptop Backpack', 'Gray', 40, 15, 35, 3, 3),
('Travel Tote Bag', 'Beige', 50, 20, 40, 4, 4);

-- Insert data ke Designer
INSERT INTO Designer (namaDesigner) VALUES
('Alessandro Michele'),
('Nicolas Ghesquière'),
('Miuccia Prada'),
('Karl Lagerfeld');

-- Insert data ke Design
INSERT INTO Design (idDesigner, idTas) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4);

-- Insert data ke Review
INSERT INTO Review (rateValue, reviewDescription, idTas, id) VALUES
(5, 'Great clutch, love the design!', 1, 1),
(4, 'Nice crossbody bag, good quality.', 2, 2),
(4, 'Spacious laptop backpack, comfortable to wear.', 3, 1),
(5, 'Beautiful tote bag, perfect for travel.', 4, 2);

-- Insert data ke Teman
INSERT INTO Teman (idFollow, idFollowing) VALUES
(1, 2),
(2, 1);

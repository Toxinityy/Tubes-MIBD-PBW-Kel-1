-- Membuat database
CREATE DATABASE Review_Tas;

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
  fotoProfile VARCHAR(255)
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

-- Tabel Designer
CREATE TABLE Designer (
  idDesigner INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  namaDesigner VARCHAR(250)
);

-- Tabel Tas
CREATE TABLE Tas (
  idTas INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  namaTas VARCHAR(250),
  deskripsi TEXT,
  warna VARCHAR(100),
  panjang INT,
  lebar INT,
  tinggi INT,
  foto VARCHAR(255),
  idMerk INT,
  idDesigner INT,
  FOREIGN KEY (idMerk) REFERENCES Merk(idMerk),
  FOREIGN KEY (idDesigner) REFERENCES Designer(idDesigner)
);

-- Tabel Tas-SubKategori
CREATE TABLE TasSubKat(
  idTas int,
  idSubKategori int,
  FOREIGN KEY (idTas) REFERENCES Tas(idTas),
  FOREIGN KEY (idSubKategori) REFERENCES SubKategori(idSubKategori)
);

-- Tabel Review
CREATE TABLE Review (
  idReview INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  rateValue INT,
  reviewDescription TEXT,
  idTas INT,
  id INT,
  currentDate DATE,
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
-- Insert data ke Kategori
INSERT INTO Kategori (namaKategori) VALUES
('Handbags'),
('Backpacks'),
('Tote Bags');

-- Insert data ke SubKategori
INSERT INTO SubKategori (idKategori, namaSubKategori) VALUES
(1, 'Clutches'),
(1, 'Crossbody Bags'),
(2, 'Laptop Backpacks'),
(2, 'Travel Backpacks'),
(3, 'Canvas Totes'),
(3, 'Leather Totes'),
(1, 'Sling Bags'),
(1, 'Shoulder Bags'),
(1, 'Hobo Bags'),
(1, 'Evening Bags'),
(2, 'Hiking Backpacks'),
(2, 'School Backpacks'),
(2, 'Sports Backpacks'),
(2, 'Camera Backpacks'),
(2, 'Rolling Backpacks'),
(3, 'Beach Totes'),
(3, 'Shopping Totes'),
(3, 'Work Totes'),
(3, 'Weekend Totes'),
(3, 'Picnic Totes'),
(1, 'Bucket Bags'),
(1, 'Messenger Bags'),
(2, 'Cycling Backpacks'),
(2, 'Business Backpacks'),
(3, 'Gym Totes');


-- Insert data ke Merk
INSERT INTO Merk (namaMerk) VALUES
('Gucci'),
('Louis Vuitton'),
('Prada'),
('Chanel'), ('Adidas'),
('Atlas'), ('The North Face'), ('Eiger'),
('Xiaomi'), ('Ulu');

-- Insert data ke Designer
INSERT INTO Designer (namaDesigner) VALUES
('Alessandro Michele'),
('Nicolas Ghesquière'),
('Miuccia Prada'),
('Karl Lagerfeld');

-- Insert data ke Publik
INSERT INTO Publik (password, username, firstName, lastName, emailPengguna, accountCreatedDate, fotoProfile) VALUES
('password123', 'user1', 'John', 'Doe', 'john.doe@example.com', '2023-01-15', '../img/user-no-profile.png'),
('password456', 'user2', 'Jane', 'Smith', 'jane.smith@example.com', '2023-02-20', '../img/user-no-profile.png'),
('password789', 'user3', 'David', 'Johnson', 'david.johnson@example.com', '2023-03-10', '../img/user-no-profile.png'),
('passwordabc', 'user4', 'Emily', 'Brown', 'emily.brown@example.com', '2023-04-05', '../img/user-no-profile.png'),
('passwordxyz', 'user5', 'Michael', 'Davis', 'michael.davis@example.com', '2023-05-15', '../img/user-no-profile.png'),
('password123', 'user6', 'Sarah', 'Miller', 'sarah.miller@example.com', '2023-06-20', '../img/user-no-profile.png'),
('password456', 'user7', 'Daniel', 'Wilson', 'daniel.wilson@example.com', '2023-07-01', '../img/user-no-profile.png'),
('password789', 'user8', 'Olivia', 'Anderson', 'olivia.anderson@example.com', '2023-08-10', '../img/user-no-profile.png'),
('passwordabc', 'user9', 'Andrew', 'Taylor', 'andrew.taylor@example.com', '2023-09-25', '../img/user-no-profile.png'),
('passwordxyz', 'user10', 'Sophia', 'Martin', 'sophia.martin@example.com', '2023-10-18', '../img/user-no-profile.png'),
('password123', 'user11', 'Christopher', 'Clark', 'christopher.clark@example.com', '2023-11-30', '../img/user-no-profile.png'),
('password456', 'user12', 'Ava', 'Walker', 'ava.walker@example.com', '2023-12-12', '../img/user-no-profile.png');

-- Insert data ke Admin
INSERT INTO Admin (password, username, firstName, lastName, emailPengguna, accountCreatedDate) VALUES
('adminpass', 'admin1', 'Admin', 'User', 'admin@example.com', '2023-01-01');

-- Insert data ke Tas
INSERT INTO Tas (namaTas, deskripsi, warna, panjang, lebar, tinggi, foto, idMerk, idDesigner) VALUES
('Duffel Bag', 
  "The Duffel Bag is a versatile and spacious travel companion. Made with durable materials, it offers ample storage space for your belongings. Whether you're going on a weekend getaway or hitting the gym, this bag provides functionality and style."
  ,'Brown', 25, 10, 15, '../img/backpack/bag 4.png', 1, 1),
('Pink Day Pack',
  "The Pink Day Pack is a trendy and practical backpack designed for everyday use. Its vibrant pink color adds a pop of personality to your outfit. With multiple compartments and padded straps, it offers comfort and organization for your essentials. Perfect for school, work, or casual outings."
  ,'Pink', 30, 20, 50,'../img/backpack/bag 5.png', 4, 2),
('Black Travel Backpack', 
  "The Black Travel Backpack is a sleek and reliable companion for your adventures. Crafted with high-quality materials, it combines style and durability. With its spacious compartments, padded laptop sleeve, and ergonomic design, it ensures convenience and comfort during your travels. Whether you're exploring the city or embarking on a hiking trip, this backpack is built to accompany you every step of the way."
  ,'Black', 25, 10, 50, '../img/backpack/Travel-Backpack-PNG-Free-Download.png', 1, 3);

INSERT INTO Tas (namaTas, deskripsi, warna, panjang, lebar, tinggi, foto, idMerk, idDesigner) VALUES
('Sports Duffel Bag',
  "The Sports Duffel Bag is designed for athletes on the go. With its sturdy construction and spacious compartments, it can hold all your sports gear and essentials. The adjustable straps and reinforced handles make it easy to carry, while the ventilated compartments keep your belongings fresh. Stay organized and ready for action with this versatile duffel bag.",
  'Black', 28, 12, 16, '../img/backpack/bag 6.png', 2, NULL),
('Casual Daypack',
  "The Casual Daypack is a stylish and practical backpack suitable for everyday use. Its minimalist design and neutral color make it a versatile accessory for any outfit. The multiple pockets and padded shoulder straps provide comfort and convenience. Whether you're heading to work, school, or a casual outing, this daypack has got you covered.",
  'Navy Blue', 32, 15, 40, '../img/backpack/bag 7.png', 9, NULL),
('Hiking Backpack',
  "The Hiking Backpack is a reliable companion for outdoor enthusiasts. Built with durable materials and a spacious design, it can withstand rugged terrains and unpredictable weather conditions. The adjustable straps, padded back panel, and waist belt ensure a comfortable fit during long hikes. Stay prepared and organized with this functional hiking backpack.",
  'Red', 35, 18, 55, '../img/backpack/bag 8.png', 7, NULL),
('Convertible Travel Bag',
  "The Convertible Travel Bag offers versatility and convenience for your travel needs. It can be used as a backpack, duffel bag, or shoulder bag, adapting to different situations. With its expandable compartments and multiple carrying options, it provides ample storage and easy transport. Whether you're going on a weekend getaway or a business trip, this bag adapts to your travel style.",
  'Gray', 27, 14, 30, '../img/backpack/bag 9.png', 3, NULL),
('Classic Leather Clutch',
  "The Classic Leather Clutch is a timeless accessory for professionals. Crafted from genuine leather, it exudes sophistication and elegance. The spacious interior, multiple compartments, and dedicated laptop sleeve make it perfect for organizing your work essentials. Carry your documents and devices in style with this classic clutch.",
  'Brown', 38, 8, 28, '../img/backpack/bag 3.png', 1, NULL),
('Trekking Backpack',
  "The Trekking Backpack is designed for avid trekkers and adventurers. Its rugged construction, reinforced straps, and waterproof materials make it suitable for challenging expeditions. The adjustable suspension system, hip belt, and numerous pockets provide comfort and storage options. Conquer the great outdoors with this reliable trekking backpack.",
  'Orange', 40, 20, 60, '../img/backpack/bag 11.png', 6, NULL),
('Stylish Laptop Bag',
  "The Stylish Laptop Bag combines fashion and functionality. With its modern design and premium materials, it complements your professional attire. The padded laptop compartment, organizational pockets, and detachable shoulder strap offer convenience and versatility. Elevate your style while protecting your valuable devices with this sleek laptop bag.",
  'Black', 32, 10, 25, '../img/backpack/bag 12.png', 10, NULL),
('Weekender Duffel Bag',
  "The Weekender Duffel Bag is the perfect companion for short trips and weekend getaways. Its spacious interior, durable fabric, and multiple pockets allow you to pack everything you need. The adjustable shoulder strap and padded handles ensure comfortable carrying. Travel in style and convenience with this versatile weekender bag.",
  'Navy Blue', 30, 15, 20, '../img/backpack/bag 13.png', 1, NULL),
('Outdoor Camping Backpack',
  "The Outdoor Camping Backpack is designed for outdoor enthusiasts and campers. It offers ample storage space for camping gear, clothing, and essentials. The waterproof material, reinforced straps, and adjustable suspension system make it suitable for rugged terrains. Stay prepared and organized during your camping adventures with this reliable backpack.",
  'Green', 35, 18, 50, '../img/backpack/bag 14.png', 8, NULL);

-- Tas ke SubKategori -> TasSubKat
INSERT INTO TasSubKat(idTas, idSubKategori) VALUES
(1, 15),
(2, 3), (2, 12),
(3, 4), (3, 11),
(4, 13),
(5, 2), (5, 22),
(6, 11), (6, 4),
(7, 4),
(8, 1), (8, 7),
(9, 11), (9, 23),
(10, 3),
(11, 22), (11, 9),
(12, 4), (12, 11);


-- Insert data ke Review
-- Insert reviews for idTas = 1
INSERT INTO Review (rateValue, reviewDescription, idTas, id, currentDate)
VALUES
  (5, 'Great clutch, love the design!', 1, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Nice crossbody bag, good quality.', 1, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (1, 'Terrible laptop backpack, do not buy.', 1, 3, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Top-notch tote bag, worth the price.', 1, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Good quality clutch with unique design.', 1, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (3, 'Comfortable and practical backpack.', 1, 3,CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Elegant crossbody bag for any occasion.', 1, 4, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Reliable and spacious handbag.', 1, 5, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (2, 'Disappointing laptop backpack, poor durability.', 1, 6, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Functional and stylish tote bag.', 1, 7, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Great value clutch, exceeded my expectations.', 1, 8, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY);


-- Insert reviews for idTas = 2
INSERT INTO Review (rateValue, reviewDescription, idTas, id, currentDate)
VALUES
  (4, 'Spacious laptop backpack, comfortable to wear.', 2, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Beautiful tote bag, perfect for travel.', 2, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Spacious laptop backpack, comfortable to wear.', 2, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Beautiful tote bag, perfect for travel.', 2, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (3, 'Decent handbag, could be better.', 2, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Stylish backpack with ample storage.', 2, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Excellent tote bag, highly recommended.', 2, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (2, 'Poor quality clutch, disappointed.', 2, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Durable and functional backpack.', 2, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (3, 'Average crossbody bag, nothing special.', 2, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Versatile and stylish handbag.', 2, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY);

-- Insert reviews for idTas = 3
INSERT INTO Review (rateValue, reviewDescription, idTas, id, currentDate)
VALUES
  (4, 'Spacious laptop backpack, comfortable to wear.', 3, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Beautiful tote bag, perfect for travel.', 3, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (1, 'Terrible laptop backpack, do not buy.', 3, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Stylish backpack with ample storage.', 3, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Excellent tote bag, highly recommended.', 3, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (2, 'Poor quality clutch, disappointed.', 3, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Durable and functional backpack.', 3, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (3, 'Average crossbody bag, nothing special.', 3, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Versatile and stylish handbag.', 3, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY);

-- Insert reviews for idTas = 4
INSERT INTO Review (rateValue, reviewDescription, idTas, id, currentDate)
VALUES
  (5, 'Spacious laptop backpack, comfortable to wear.', 4, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Beautiful tote bag, perfect for travel.', 4, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Stylish backpack with ample storage.', 4, 3, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (3, 'Decent handbag, could be better.', 4, 4, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Durable and functional backpack.', 4, 5, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY);

-- Insert reviews for idTas = 5
INSERT INTO Review (rateValue, reviewDescription, idTas, id, currentDate)
VALUES
  (4, 'Comfortable backpack with good storage options.', 5, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Stylish tote bag, perfect for any occasion.', 5, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Spacious and practical backpack for travel.', 5, 3, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (3, 'Decent handbag, but could be better quality.', 5, 4, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Functional and durable backpack for everyday use.', 5, 5, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY);

-- Insert reviews for idTas = 6
INSERT INTO Review (rateValue, reviewDescription, idTas, id, currentDate)
VALUES
  (5, 'Versatile and spacious backpack, highly recommended.', 6, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Elegant and practical tote bag for work or travel.', 6, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (3, 'Decent handbag, but the material could be better.', 6, 3, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Durable and functional backpack for outdoor adventures.', 6, 4, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Compact and stylish crossbody bag.', 6, 5, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY);

-- Insert reviews for idTas = 7
INSERT INTO Review (rateValue, reviewDescription, idTas, id, currentDate)
VALUES
  (4, 'Spacious backpack with excellent storage compartments.', 7, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Fashionable and versatile tote bag.', 7, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Stylish backpack with reliable durability.', 7, 3, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (3, 'Decent handbag, but could be more functional.', 7, 4, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Durable and comfortable backpack for travel.', 7, 5, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY);

-- Insert reviews for idTas = 8
INSERT INTO Review (rateValue, reviewDescription, idTas, id, currentDate)
VALUES
  (5, 'Spacious and comfortable backpack for travel.', 8, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Stylish and versatile tote bag.', 8, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (3, 'Average handbag, nothing special.', 8, 3, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Durable backpack with good organization features.', 8, 4, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Compact and stylish crossbody bag for everyday use.', 8, 5, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY);

-- Insert reviews for idTas = 9
INSERT INTO Review (rateValue, reviewDescription, idTas, id, currentDate)
VALUES
  (4, 'Functional and spacious backpack for outdoor adventures.', 9, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Elegant and practical tote bag for work or travel.', 9, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Decent handbag, but the material could be better.', 9, 3, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (3, 'Durable and functional backpack for everyday use.', 9, 4, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Stylish and compact crossbody bag.', 9, 5, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY);

-- Insert reviews for idTas = 10
INSERT INTO Review (rateValue, reviewDescription, idTas, id, currentDate)
VALUES
  (5, 'Compact and stylish crossbody bag for everyday use.', 10, 5, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY);

-- Insert reviews for idTas = 11
INSERT INTO Review (rateValue, reviewDescription, idTas, id, currentDate)
VALUES
  (4, 'Spacious and comfortable backpack for travel.', 11, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Stylish and versatile tote bag.', 11, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Average handbag, nothing special.', 11, 3, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (3, 'Durable backpack with good organization features.', 11, 4, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Compact and stylish crossbody bag for everyday use.', 11, 5, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY);

-- Insert reviews for idTas = 12
INSERT INTO Review (rateValue, reviewDescription, idTas, id, currentDate)
VALUES
  (5, 'Functional and spacious backpack for outdoor adventures.', 12, 1, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Elegant and practical tote bag for work or travel.', 12, 2, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (3, 'Decent handbag, but the material could be better.', 12, 3, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (4, 'Durable and functional backpack for everyday use.', 12, 4, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY),
  (5, 'Stylish and compact crossbody bag.', 12, 5, CURDATE() - INTERVAL FLOOR(RAND() * 365) DAY);


-- Insert data ke Teman
INSERT INTO Teman (idFollow, idFollowing)
VALUES
(1, 2),
(2, 1),
(1, 3),
(3, 1),
(2, 4),
(4, 2),
(3, 5),
(5, 3),
(4, 6),
(6, 4),
(5, 7),
(7, 5),
(6, 8),
(8, 6),
(7, 9),
(9, 7),
(8, 10),
(10, 8),
(9, 11),
(11, 9),
(10, 12),
(12, 10);

CREATE VIEW TasReviewPublik AS
SELECT t.idTas, t.namaTas, t.foto, t.deskripsi, t.warna, t.panjang, t.lebar, t.tinggi, 
    ROUND(AVG(r.rateValue), 2) AS averageRateValue, COUNT(r.id) AS personCounter
FROM Tas t
JOIN Review r ON t.idTas = r.idTas
GROUP BY t.namaTas, t.foto;

CREATE VIEW TasDetailed AS
SELECT t.idTas, t.namaTas, t.foto, t.deskripsi, t.warna, t.panjang, t.lebar, t.tinggi,  
        ROUND(AVG(r.rateValue), 2) AS averageRateValue, 
        COUNT(r.id) AS personCounter, m.namaMerk, d.namaDesigner,
        k.namaKategori
FROM Tas t 
JOIN TasSubKat tsk on t.idTas = tsk.idTas
JOIN SubKategori s on tsk.idSubKategori = s.idSubKategori
JOIN Review r ON t.idTas = r.idTas
JOIN Merk m ON m.idMerk = t.idMerk
LEFT OUTER JOIN Designer d ON t.idDesigner = d.idDesigner
JOIN Kategori k ON k.idKategori = s.idKategori
GROUP BY t.namaTas, t.foto;
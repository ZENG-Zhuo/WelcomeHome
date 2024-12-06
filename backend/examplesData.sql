USE welcomehome;

-- Insert Categories
INSERT INTO Category (mainCategory, subCategory, catNotes) VALUES
('Furniture', 'Chairs', 'Various types of chairs'),
('Furniture', 'Tables', 'Different styles of tables'),
('Electronics', 'Mobile', 'Smartphones and accessories'),
('Electronics', 'Computers', 'Laptops and desktops');

-- Insert Items
INSERT INTO Item (iDescription, photo, color, isNew, hasPieces, material, mainCategory, subCategory) VALUES
('Wooden Dining Chair', 'chair1.jpg', 'Brown', TRUE, TRUE, 'Wood', 'Furniture', 'Chairs'),
('Glass Coffee Table', 'table1.jpg', 'Transparent', TRUE, FALSE, 'Glass', 'Furniture', 'Tables'),
('Smartphone XYZ', 'phone1.jpg', 'Black', TRUE, TRUE, 'Plastic', 'Electronics', 'Mobile'),
('Gaming Laptop ABC', 'laptop1.jpg', 'Silver', TRUE, TRUE, 'Aluminum', 'Electronics', 'Computers');

-- Insert Persons
INSERT INTO Person (userName, password, fname, lname, email) VALUES
('jdoe', 'password123', 'John', 'Doe', 'jdoe@example.com'),
('asmith', 'password456', 'Alice', 'Smith', 'asmith@example.com');

-- Insert Person Phones
INSERT INTO PersonPhone (userName, phone) VALUES
('jdoe', '555-1234'),
('asmith', '555-5678');

-- Insert Donated Items
INSERT INTO DonatedBy (ItemID, userName, donateDate) VALUES
(1, 'jdoe', '2024-01-15'),
(2, 'asmith', '2024-01-20');

-- Insert Roles
INSERT INTO Role (roleID, rDescription) VALUES
('admin', 'Administrator'),
('volunteer', 'Volunteer');

-- Insert Acts
INSERT INTO Act (userName, roleID) VALUES
('jdoe', 'admin'),
('asmith', 'volunteer');

-- Insert Locations
INSERT INTO Location (roomNum, shelfNum, shelf, shelfDescription) VALUES
(1, 1, 'A', 'Main storage shelf'),
(1, 2, 'B', 'Secondary storage shelf');

-- Insert Pieces
INSERT INTO Piece (ItemID, pieceNum, pDescription, length, width, height, roomNum, shelfNum, pNotes) VALUES
(1, 1, 'Legs of the chair', 30, 30, 100, 1, 1, 'Solid wood legs'),
(1, 2, 'Seat cushion', 50, 50, 10, 1, 1, 'Comfortable cushion');

-- Insert Orders
INSERT INTO Ordered (orderDate, orderNotes, supervisor, client) VALUES
('2024-02-01', 'Order for office furniture', 'jdoe', 'asmith');

-- Insert Items in Orders
INSERT INTO ItemIn (ItemID, orderID, found) VALUES
(1, 1, FALSE),
(2, 1, TRUE);

-- Insert Delivered Items
INSERT INTO Delivered (userName, orderID, status, date) VALUES
('jdoe', 1, 'Delivered', '2024-02-05'),
('asmith', 1, 'Received', '2024-02-06');
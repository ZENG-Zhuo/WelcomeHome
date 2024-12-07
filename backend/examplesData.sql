USE welcomehome;

-- Insert Categories
INSERT INTO Category (mainCategory, subCategory, catNotes) VALUES
('Furniture', 'Chairs', 'Various types of chairs'),
('Furniture', 'Tables', 'Different styles of tables'),
('Electronics', 'Mobile', 'Smartphones and accessories'),
('Electronics', 'Computers', 'Laptops and desktops'),
('Clothing', 'Men', 'Men\'s apparel'),
('Clothing', 'Women', 'Women\'s apparel');

-- Insert Items
INSERT INTO Item (iDescription, photo, color, isNew, hasPieces, material, mainCategory, subCategory) VALUES
('Wooden Dining Chair', 'chair1.jpg', 'Brown', TRUE, TRUE, 'Wood', 'Furniture', 'Chairs'),
('Glass Coffee Table', 'table1.jpg', 'Transparent', TRUE, FALSE, 'Glass', 'Furniture', 'Tables'),
('Smartphone XYZ', 'phone1.jpg', 'Black', TRUE, TRUE, 'Plastic', 'Electronics', 'Mobile'),
('Gaming Laptop ABC', 'laptop1.jpg', 'Silver', TRUE, TRUE, 'Aluminum', 'Electronics', 'Computers'),
('Leather Jacket', 'jacket1.jpg', 'Black', TRUE, TRUE, 'Leather', 'Clothing', 'Men'),
('Summer Dress', 'dress1.jpg', 'Red', TRUE, TRUE, 'Cotton', 'Clothing', 'Women');

-- Insert Persons
INSERT INTO Person (userName, password, fname, lname, email) VALUES
('jdoe', 'password123', 'John', 'Doe', 'jdoe@example.com'),
('asmith', 'password456', 'Alice', 'Smith', 'asmith@example.com'),
('bwhite', 'password789', 'Bob', 'White', 'bwhite@example.com'),
('cklein', 'password321', 'Charlie', 'Klein', 'cklein@example.com');

-- Insert Person Phones
INSERT INTO PersonPhone (userName, phone) VALUES
('jdoe', '555-1234'),
('asmith', '555-5678'),
('bwhite', '555-8765'),
('cklein', '555-4321');

-- Insert Donated Items
INSERT INTO DonatedBy (ItemID, userName, donateDate) VALUES
(1, 'jdoe', '2024-01-15'),
(2, 'asmith', '2024-01-20'),
(3, 'bwhite', '2024-01-22'),
(4, 'cklein', '2024-01-25');

-- Insert Roles
INSERT INTO Role (roleID, rDescription) VALUES
('admin', 'Administrator'),
('volunteer', 'Volunteer'),
('manager', 'Manager'),
('staff', 'Staff'),
('donor', 'Donor');  -- Added donor role

-- Insert Acts
INSERT INTO Act (userName, roleID) VALUES
('jdoe', 'admin'),
('asmith', 'volunteer'),
('bwhite', 'manager'),
('cklein', 'staff'),
('jdoe', 'donor'),  -- Assigning donor role to John Doe
('asmith', 'donor'); -- Assigning donor role to Alice Smith

-- Insert Locations
INSERT INTO Location (roomNum, shelfNum, shelf, shelfDescription) VALUES
(1, 1, 'A', 'Main storage shelf'),
(1, 2, 'B', 'Secondary storage shelf'),
(2, 1, 'C', 'Clothing shelf'),
(2, 2, 'D', 'Electronics shelf');

-- Insert Pieces
INSERT INTO Piece (ItemID, pieceNum, pDescription, length, width, height, roomNum, shelfNum, pNotes) VALUES
(1, 1, 'Legs of the chair', 30, 30, 100, 1, 1, 'Solid wood legs'),
(1, 2, 'Seat cushion', 50, 50, 10, 1, 1, 'Comfortable cushion'),
(5, 1, 'Sleeves', 20, 15, 60, 2, 1, 'Stylish leather sleeves'),
(6, 1, 'Skirt', 30, 25, 50, 2, 1, 'Flowy summer skirt');

-- Insert Orders
INSERT INTO Ordered (orderDate, orderNotes, supervisor, client) VALUES
('2024-02-01', 'Order for office furniture', 'jdoe', 'asmith'),
('2024-02-02', 'Order for new electronics', 'bwhite', 'cklein');

-- Insert Items in Orders
INSERT INTO ItemIn (ItemID, orderID, found) VALUES
(1, 1, FALSE),
(2, 1, TRUE),
(3, 2, TRUE),
(4, 2, FALSE);

-- Insert Delivered Items
INSERT INTO Delivered (userName, orderID, status, date) VALUES
('jdoe', 1, 'Delivered', '2024-02-05'),
('asmith', 1, 'Received', '2024-02-06'),
('bwhite', 2, 'Delivered', '2024-02-07'),
('cklein', 2, 'Received', '2024-02-08');
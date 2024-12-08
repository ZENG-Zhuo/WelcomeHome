USE welcomehome;

-- Insert Categories
INSERT IGNORE INTO Category (mainCategory, subCategory, catNotes) VALUES
('Furniture', 'Chairs', 'Various types of chairs'),
('Furniture', 'Tables', 'Different styles of tables'),
('Electronics', 'Mobile', 'Smartphones and accessories'),
('Electronics', 'Computers', 'Laptops and desktops'),
('Clothing', 'Men', 'Men\'s apparel'),
('Clothing', 'Women', 'Women\'s apparel');

-- Insert Items
INSERT IGNORE INTO Item (iDescription, photo, color, isNew, hasPieces, material, mainCategory, subCategory) VALUES
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
('cilent', 'Client'),
('staff', 'Staff'),
('donor', 'Donor');  -- Added donor role

-- Insert Acts
INSERT INTO Act (userName, roleID) VALUES
('jdoe', 'admin'),
('asmith', 'volunteer'),
('bwhite', 'cilent'),
('cklein', 'staff'),
('jdoe', 'donor'),  -- Assigning donor role to John Doe
('asmith', 'donor'); -- Assigning donor role to Alice Smith

-- Insert Locations
INSERT IGNORE INTO Location (roomNum, shelfNum, shelf, shelfDescription) VALUES
(1, 1, 'A', 'Main storage shelf'),
(1, 2, 'B', 'Secondary storage shelf'),
(2, 1, 'C', 'Clothing shelf'),
(2, 2, 'D', 'Electronics shelf');

INSERT INTO Location (roomNum, shelfNum, shelf, shelfDescription) VALUES
(-1, -1, 'Z', 'Holding location for items in preparation');

-- Insert Pieces
INSERT IGNORE INTO Piece (ItemID, pieceNum, pDescription, length, width, height, roomNum, shelfNum, pNotes) VALUES
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



-- Insert Much More Test Data

-- Insert Categories
INSERT IGNORE INTO Category (mainCategory, subCategory, catNotes) VALUES
('Furniture', 'Beds', 'Various types of beds'),
('Furniture', 'Dressers', 'Bedroom dressers and drawers'),
('Electronics', 'Speakers', 'Home and portable speakers'),
('Electronics', 'Cameras', 'Digital cameras and accessories'),
('Clothing', 'Shoes', 'Footwear for men, women, and children'),
('Clothing', 'Hats', 'Fashionable hats and caps');

-- Insert Items
INSERT IGNORE INTO Item (iDescription, photo, color, isNew, hasPieces, material, mainCategory, subCategory) VALUES
('King Size Bed', 'bed1.jpg', 'White', TRUE, TRUE, 'Wood', 'Furniture', 'Beds'),
('Wooden Dresser', 'dresser1.jpg', 'Dark Brown', TRUE, FALSE, 'Wood', 'Furniture', 'Dressers'),
('Bluetooth Speaker', 'speaker1.jpg', 'Black', TRUE, TRUE, 'Plastic', 'Electronics', 'Speakers'),
('Digital Camera', 'camera1.jpg', 'Silver', TRUE, TRUE, 'Metal', 'Electronics', 'Cameras'),
('Running Shoes', 'shoes1.jpg', 'Blue', TRUE, TRUE, 'Mesh', 'Clothing', 'Shoes'),
('Baseball Cap', 'hat1.jpg', 'Red', TRUE, TRUE, 'Cotton', 'Clothing', 'Hats'),
('Queen Size Bed', 'bed2.jpg', 'Beige', TRUE, TRUE, 'Wood', 'Furniture', 'Beds'),
('Glass Top Dresser', 'dresser2.jpg', 'Light Brown', TRUE, TRUE, 'Wood/Glass', 'Furniture', 'Dressers'),
('Portable Speaker', 'speaker2.jpg', 'White', TRUE, FALSE, 'Plastic', 'Electronics', 'Speakers'),
('Professional Camera', 'camera2.jpg', 'Black', TRUE, TRUE, 'Plastic/Metal', 'Electronics', 'Cameras'),
('High Heels', 'heels1.jpg', 'Black', TRUE, TRUE, 'Leather', 'Clothing', 'Shoes'),
('Sun Hat', 'hat2.jpg', 'Yellow', TRUE, TRUE, 'Straw', 'Clothing', 'Hats');

-- Insert Pieces
INSERT IGNORE INTO Piece (ItemID, pieceNum, pDescription, length, width, height, roomNum, shelfNum, pNotes) VALUES
(11, 1, 'Bed frame', 200, 150, 30, 1, 1, 'Solid wood bed frame'),
(11, 2, 'Mattress', 200, 150, 20, 1, 1, 'Memory foam mattress'),
(12, 1, 'Dresser drawers', 80, 50, 10, 2, 1, 'Wooden storage drawers'),
(13, 1, 'Speaker body', 20, 20, 10, 4, 1, 'Wireless Bluetooth speaker body'),
(14, 1, 'Camera body', 15, 10, 5, 4, 2, 'Digital camera body'),
(15, 1, 'Shoe sole', 25, 10, 3, 2, 1, 'Rubber sole for durability'),
(15, 2, 'Shoe upper', 25, 20, 10, 2, 1, 'Breathable mesh upper'),
(16, 1, 'Hat brim', 20, 20, 5, 3, 1, 'Wide brim for sun protection'),
(16, 2, 'Hat crown', 20, 20, 10, 3, 1, 'Soft cotton fabric crown'),
(17, 1, 'Bed frame', 200, 150, 30, 1, 1, 'Sturdy wooden frame'),
(17, 2, 'Mattress', 200, 150, 20, 1, 1, 'Comfortable mattress'),
(18, 1, 'Dresser drawers', 100, 60, 12, 2, 2, 'Wooden dresser drawers'),
(19, 1, 'Speaker body', 15, 15, 8, 4, 1, 'Compact portable speaker'),
(20, 1, 'Camera body', 20, 15, 7, 4, 2, 'High-end professional camera'),
(21, 1, 'Shoe heel', 15, 5, 10, 2, 1, 'Leather heel'),
(21, 2, 'Shoe upper', 25, 20, 10, 2, 1, 'Stylish leather upper'),
(22, 1, 'Hat body', 20, 20, 12, 3, 1, 'Classic straw hat'),
(22, 2, 'Hat brim', 20, 20, 5, 3, 1, 'Wide brim for sun protection');

-- Insert more Items
INSERT IGNORE INTO Item (iDescription, photo, color, isNew, hasPieces, material, mainCategory, subCategory) VALUES
('Double Bed', 'bed3.jpg', 'Gray', TRUE, TRUE, 'Wood', 'Furniture', 'Beds'),
('Cabinet with Mirror', 'dresser3.jpg', 'White', TRUE, TRUE, 'Wood/Glass', 'Furniture', 'Dressers'),
('Home Speaker', 'speaker3.jpg', 'Green', TRUE, TRUE, 'Plastic', 'Electronics', 'Speakers'),
('Lens for Camera', 'camera3.jpg', 'Black', TRUE, TRUE, 'Glass/Metal', 'Electronics', 'Cameras'),
('Sneakers', 'sneakers1.jpg', 'Gray', TRUE, TRUE, 'Mesh', 'Clothing', 'Shoes'),
('Beanie', 'beanie1.jpg', 'Blue', TRUE, TRUE, 'Wool', 'Clothing', 'Hats');

-- Insert Pieces for New Items
INSERT IGNORE INTO Piece (ItemID, pieceNum, pDescription, length, width, height, roomNum, shelfNum, pNotes) VALUES
(23, 1, 'Bed frame', 200, 150, 30, 1, 1, 'Solid wood bed frame'),
(23, 2, 'Mattress', 200, 150, 20, 1, 1, 'Memory foam mattress'),
(24, 1, 'Dresser with mirror', 100, 50, 12, 2, 2, 'Wooden dresser with mirror'),
(25, 1, 'Speaker body', 25, 25, 12, 4, 1, 'Compact home speaker'),
(26, 1, 'Camera lens', 15, 15, 5, 4, 2, 'High-definition camera lens'),
(27, 1, 'Shoe sole', 25, 10, 3, 2, 1, 'Rubber sole for comfort'),
(28, 1, 'Beanie knit', 20, 20, 15, 3, 1, 'Warm wool knit beanie');

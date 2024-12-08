CREATE database welcomehome;
use welcomehome;
-- ALTER USER 'root'@'localhost' IDENTIFIED BY 'TPGSecretPass';

CREATE TABLE Category (
    mainCategory VARCHAR(50) NOT NULL,
    subCategory VARCHAR(50) NOT NULL,
    catNotes TEXT,
    PRIMARY KEY (mainCategory, subCategory)
);

CREATE TABLE Item (
    ItemID INT NOT NULL AUTO_INCREMENT,
    iDescription TEXT,
    photo VARCHAR(20), -- BLOB is better here, but for simplicity, we change it to VARCHAR; For p3 implementation, we recommend you to implement as blob
    color VARCHAR(20),
    isNew BOOLEAN DEFAULT TRUE,
    hasPieces BOOLEAN DEFAULT FALSE, -- for Piece check
    material VARCHAR(50),
    mainCategory VARCHAR(50) NOT NULL,
    subCategory VARCHAR(50) NOT NULL,
    PRIMARY KEY (ItemID),
    FOREIGN KEY (mainCategory, subCategory) REFERENCES Category(mainCategory, subCategory)
);


CREATE TABLE Person (
    userName VARCHAR(50) NOT NULL,
    password VARCHAR(512) NOT NULL,
    fname VARCHAR(50) NOT NULL,
    lname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    PRIMARY KEY (userName)
);

CREATE TABLE PersonPhone (
    userName VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    PRIMARY KEY (userName, phone),
    FOREIGN KEY (userName) REFERENCES Person(userName)
);

CREATE TABLE DonatedBy (
    ItemID INT NOT NULL,
    userName VARCHAR(50) NOT NULL,
    donateDate DATE NOT NULL,
    PRIMARY KEY (ItemID, userName),
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID),
    FOREIGN KEY (userName) REFERENCES Person(userName)
);

CREATE TABLE Role (
    roleID VARCHAR(20) NOT NULL,
    rDescription VARCHAR(100),
    PRIMARY KEY (roleID)
);

CREATE TABLE Act (
    userName VARCHAR(50) NOT NULL,
    roleID VARCHAR(20) NOT NULL,
    PRIMARY KEY (userName, roleID),
    FOREIGN KEY (userName) REFERENCES Person(userName),
    FOREIGN KEY (roleID) REFERENCES Role(roleID)
);

CREATE TABLE Location (
    roomNum INT NOT NULL,
    shelfNum INT NOT NULL, -- not a point for deduction
    shelf VARCHAR(20),
    shelfDescription VARCHAR(200),
    PRIMARY KEY (roomNum, shelfNum)
);



CREATE TABLE Piece (
    ItemID INT NOT NULL,
    pieceNum INT NOT NULL,
    pDescription VARCHAR(200),
    length INT NOT NULL, -- for simplicity
    width INT NOT NULL,
    height INT NOT NULL,
    roomNum INT NOT NULL,
    shelfNum INT NOT NULL, 
    pNotes TEXT,
    PRIMARY KEY (ItemID, pieceNum),
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID),
    FOREIGN KEY (roomNum, shelfNum) REFERENCES Location(roomNum, shelfNum)
);

CREATE TABLE Ordered (
    orderID INT NOT NULL AUTO_INCREMENT,
    orderDate DATE NOT NULL,
    orderNotes VARCHAR(200),
    supervisor VARCHAR(50) NOT NULL,
    client VARCHAR(50) NOT NULL,
    PRIMARY KEY (orderID),
    FOREIGN KEY (supervisor) REFERENCES Person(userName),
    FOREIGN KEY (client) REFERENCES Person(userName)
);

CREATE TABLE ItemIn (
    ItemID INT NOT NULL,
    orderID INT NOT NULL,
    found BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (ItemID, orderID),
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID),
    FOREIGN KEY (orderID) REFERENCES Ordered(orderID)
);


CREATE TABLE Delivered (
    userName VARCHAR(50) NOT NULL,
    orderID INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    PRIMARY KEY (userName, orderID),
    FOREIGN KEY (userName) REFERENCES Person(userName),
    FOREIGN KEY (orderID) REFERENCES Ordered(orderID)
);

-- Triggers to trace the change of hasPieces in Item table
DELIMITER //

CREATE TRIGGER update_item_after_piece_insert 
AFTER INSERT ON Piece 
FOR EACH ROW 
BEGIN
    UPDATE Item 
    SET hasPieces = TRUE 
    WHERE ItemID = NEW.ItemID;
END; //

CREATE TRIGGER update_item_after_piece_delete 
AFTER DELETE ON Piece 
FOR EACH ROW 
BEGIN
    DECLARE remaining_pieces INT; -- number of pieces left for the item
    
    SELECT COUNT(*) INTO remaining_pieces 
    FROM Piece 
    WHERE ItemID = OLD.ItemID;
    
    IF remaining_pieces = 0 THEN
        UPDATE Item 
        SET hasPieces = FALSE 
        WHERE ItemID = OLD.ItemID;
    END IF;
END; //

CREATE TRIGGER update_item_after_piece_update
AFTER UPDATE ON Piece
FOR EACH ROW
BEGIN
    -- update hasPieces in two items
    UPDATE Item 
    SET hasPieces = 
        (SELECT 
            CASE 
                WHEN COUNT(*) > 0 THEN TRUE 
                ELSE FALSE 
            END 
         FROM Piece 
         WHERE Piece.ItemID = OLD.ItemID)
    WHERE Item.ItemID = OLD.ItemID;

    UPDATE Item 
    SET hasPieces = TRUE
    WHERE Item.ItemID = NEW.ItemID;
END; //

DELIMITER ;
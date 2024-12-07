# views/order_views.py
from flask import Blueprint, request, jsonify, session
import mysql
from utils import get_db_connection
from datetime import date
from .auth_view import staff_required, login_required

order_bp = Blueprint('order_bp', __name__)

@login_required
@order_bp.route('/orderInfo', methods=['POST']) 
def order_info():
    orderid = request.json.get('orderID')
    
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Ordered WHERE orderID = %s", (orderid,))
        order = cursor.fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 404
        print("Order info: ", order)
                
        cursor.execute("SELECT * FROM ItemIn WHERE orderID = %s", (orderid,))
        order['submit'] = True if cursor.fetchone() else False
        
        order['orderDate'] = order['orderDate'].strftime("%Y-%m-%d")
        print("Order found", order)
        return jsonify(order), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        connection.close()

@order_bp.route('/createOrder', methods=['POST'])
@login_required
@staff_required
def create_order():
    client_name = request.json.get('username')
    order_notes = request.json.get('notes')
    
    if order_notes and order_notes.strip() == "": # check if order_notes is empty
        order_notes = None
    
    # check not the staff itself
    if session['userName'] == client_name:
        return jsonify({"error": "Cannot create an order for yourself"}), 400
    
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        # check if the client exists    
        cursor.execute("SELECT * FROM Person WHERE userName = %s", (client_name,))
        result = cursor.fetchone()
        if not result:
            return jsonify({"error": "Client does not exist"}), 400

        # Ensure (client_name, 'client') exists in Act
        cursor.execute("INSERT IGNORE INTO Act (userName, roleID) VALUES (%s, 'client')", (client_name,))
        
        orderDate = date.today()
        cursor.execute(
            "INSERT INTO Ordered (orderDate, orderNotes, supervisor, client) VALUES (%s, %s, %s, %s)",
            (orderDate, order_notes, session['userName'], client_name)
        )
        connection.commit()
        
        # Retrieve the inserted orderID
        order_id = cursor.lastrowid
        return jsonify({"orderID": order_id}), 201

    except mysql.connector.Error as err:
        connection.rollback()
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        connection.close()

@login_required
@order_bp.route('/addItemsToOrder', methods=['POST'])
def add_items_to_order():
    data = request.json
    order_id = data['orderID']
    items = data['items']  # List of ItemIDs    

    connection = get_db_connection()
    cursor = connection.cursor()
    
    # Check items availability again
    unavailable_items = []
    try:
        for item_id in items:
            # EXIST for efficiency
            cursor.execute("SELECT EXISTS(SELECT * FROM ItemIn WHERE orderID = %s)", (item_id,))
            if cursor.fetchone():
                unavailable_items.append(item_id)
        if len(unavailable_items) > 0:
            return jsonify({"status": "failed", "unavailable":unavailable_items})
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    
    try:
        for item_id in items:
            cursor.execute(
                "INSERT INTO ItemIn (ItemID, orderID, found) VALUES (%s, %s, FALSE)",
                (item_id, order_id)
            )
        connection.commit()
        return jsonify({"status": "success"})
    except mysql.connector.Error as err:
        connection.rollback()
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        connection.close()

@login_required
@order_bp.route('/find_order_items', methods=['POST'])
def find_order_items():
    order_id = request.json.get('orderID')
    
    if not order_id:
        return jsonify({"error": "orderID is required"}), 400

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Query to find items in the specified order with additional piece information
    query = """
    SELECT 
        i.ItemID, 
        i.iDescription, 
        p.pieceNum, 
        p.pDescription, 
        p.length, 
        p.width, 
        p.height, 
        p.roomNum, 
        p.shelfNum
    FROM Item i
    NATURAL JOIN ItemIn ii
    NATURAL JOIN Ordered o
    NATURAL JOIN Piece p
    WHERE o.orderID = %s
    """
    
    cursor.execute(query, (order_id,))
    items = cursor.fetchall()
    cursor.close()
    connection.close()

    if not items:
        return jsonify({"message": "No items found for the given orderID"}), 404

    # Organizing the results
    item_locations = {}
    for item in items:
        item_id = item['ItemID']
        if item_id not in item_locations:
            item_locations[item_id] = {
                'description': item['iDescription'],
                'pieces': []
            }
        item_locations[item_id]['pieces'].append({
            'pieceNum': item['pieceNum'],
            'description': item['pDescription'],
            'dimensions': {
                'length': item['length'],
                'width': item['width'],
                'height': item['height']
            },
            'location': f"Room: {item['roomNum']}, Shelf: {item['shelfNum']}"
        })

    return jsonify(item_locations), 200
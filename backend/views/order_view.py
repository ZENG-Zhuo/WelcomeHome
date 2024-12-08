# views/order_views.py
from flask import Blueprint, request, jsonify, session
import mysql
from utils import get_db_connection
from datetime import date
from .auth_view import staff_required, login_required

order_bp = Blueprint('order_bp', __name__)

@order_bp.route('/orders', methods=['GET']) # test view should not expose 
def get_orders():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Ordered")
    orders = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(orders)

@order_bp.route('/createOrder', methods=['POST'])
@login_required
@staff_required
def create_order():
    client_name = request.json.get('username')
    
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
            "INSERT INTO Ordered (orderDate, supervisor, client) VALUES (%s, %s, %s)",
            (orderDate, session['userName'], client_name)
        )
        connection.commit()
        
        # Retrieve the inserted orderID
        order_id = cursor.lastrowid
        print("order_id", order_id)
        return jsonify({"orderID": order_id}), 201

    except mysql.connector.Error as err:
        connection.rollback()
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        connection.close()

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
    
    cursor.execute(query, (order_id))
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


@order_bp.route('/orderSupervised', methods=['GET'])
@login_required
def return_supervised_order():
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT orderID,orderNotes,client,orderDate,d.userName,status,date FROM ordered o LEFT JOIN delivered d USING(orderID) WHERE o.supervisor = %s", (session['userName']))
    supervise = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(supervise)

@order_bp.route('/orderDelivered', methods=['GET'])
@login_required
def return_delivered_order():
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT  * FROM delivered WHERE userName = %s", (session['userName']))
    deliver = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(deliver)

@order_bp.route('/orderStatusUpdate', methods=['POST'])
def update_order_status():
    try:
        data = request.get_json()
        order_id = data['orderID']
        if not order_id:
            return jsonify({"error": "orderID is required"}), 400
        userName = data['delivererName']
        if not userName:
            return jsonify({"error": "delivererName is required"}), 400
        status = data['status']
        date = data['modifyDate']
        if not all([status, date]):
            return jsonify({"error": "Missing required fields: status, modifyDate"}), 400
        connection = get_db_connection()
        cursor = connection.cursor()
        query = """
        UPDATE delivered 
        SET status = %s, date = %s    
        WHERE orderID = %s AND userName = %s
        """
        cursor.execute(query, (status, date, order_id, userName))
        if cursor.rowcount == 0:
            return jsonify({"error": "No record found to update. Check the provided orderID and delivererName."}), 404

        connection.commit()
        return jsonify({"status": "success"}), 200
    except mysql.connector.Error as err:
        connection.rollback()
        return jsonify({"error": str(err)}), 400
    finally:
            cursor.close()
            connection.close()

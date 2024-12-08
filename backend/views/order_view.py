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
    print("OrderID: ", orderid)
    
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Ordered WHERE orderID = %s", (orderid,))
        order = cursor.fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 404
                
        cursor.execute("SELECT * FROM ItemIn WHERE orderID = %s", (orderid,))
        order['submit'] = True if cursor.fetchone() else False
        
        order['orderDate'] = order['orderDate'].strftime("%Y-%m-%d")
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
    # print("Items to add: ", items)

    connection = get_db_connection()
    cursor = connection.cursor()
    
    # Check items availability again
    unavailable_items = []
    try:
        for item_id in items:
            # EXIST for efficiency
            cursor.execute("SELECT EXISTS(SELECT * FROM ItemIn WHERE itemID = %s)", (item_id,))
            data = cursor.fetchone()
            print("Data: ", data)
            if data[0] == 1: # exists
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

@order_bp.route('/orders/search', methods=['GET'])
def search_orders():
    order_number = request.args.get('order_number')
    client_username = request.args.get('client_username')

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    if order_number:
        cursor.execute("SELECT * FROM Ordered WHERE orderID = %s", (order_number,))
    elif client_username:
        cursor.execute("SELECT * FROM Ordered WHERE client = %s", (client_username,))
    else:
        return jsonify({"error": "Please provide either order_number or client_username."}), 400
    
    orders = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify(orders)


@order_bp.route('/orders/update_location', methods=['POST'])
@staff_required
def update_item_location():
    data = request.get_json()
    order_id = data.get('orderID')

    if not order_id:
        return jsonify({"error": "orderID is required."}), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Update the location of all pieces associated with the order to (-1, -1)
        cursor.execute("""
            UPDATE Piece 
            SET roomNum = -1, shelfNum = -1
            WHERE ItemID IN (
                SELECT ItemID FROM ItemIn WHERE orderID = %s
            )
        """, (order_id,))

        # cursor.execute("""
        #     UPDATE Ordered
        #     SET orderNotes = 'Ready for Delivery'
        #     WHERE orderID = %s
        # """, (order_id,))

        connection.commit()
    except Exception as e:
        connection.rollback()
        return jsonify({"error": f"Failed to update item locations: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()

    return jsonify({"message": "Item locations updated to (-1, -1) and order marked as ready for delivery."}), 200


@order_bp.route('/user/orders', methods=['GET'])
@login_required
def get_user_orders():
    user_name = session['userName']

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Query to get orders where the current user is a client
        cursor.execute("""
            SELECT o.orderID, o.orderDate, o.orderNotes, o.supervisor, d.username as deliverer, d.status, d.date
            FROM Ordered o
            left JOIN Delivered d on d.orderID = o.orderID
            WHERE o.client = %s
        """, (user_name,))
        
        client_orders = cursor.fetchall()

        # Query to get orders where the current user is a supervisor
        cursor.execute("""
            SELECT o.orderID, o.orderDate, o.orderNotes, o.supervisor, d.username as deliverer, d.status, d.date
            FROM Ordered o
            left JOIN Delivered d on d.orderID = o.orderID
            WHERE o.supervisor = %s
        """, (user_name,))
        
        supervised_orders = cursor.fetchall()

        # Query to get delivered orders with order date and notes
        cursor.execute("""
            SELECT o.orderID, o.orderDate, o.orderNotes, o.supervisor, d.username as deliverer, d.status, d.date
            FROM Delivered d
            NATURAL JOIN Ordered o
            WHERE d.userName = %s
        """, (user_name,))
        
        delivered_orders = cursor.fetchall()

        # Combine all results
        orders = {
            "client_orders": client_orders,
            "supervised_orders": supervised_orders,
            "delivered_orders": delivered_orders
        }

    except Exception as e:
        return jsonify({"error": f"Failed to retrieve user's orders: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()

    return jsonify(orders), 200


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
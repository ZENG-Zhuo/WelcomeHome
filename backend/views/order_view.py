# views/order_views.py
from flask import Blueprint, request, jsonify
from utils import get_db_connection

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

@order_bp.route('/orders', methods=['POST'])
def create_order():
    new_order = request.get_json()
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO Ordered (orderDate, orderNotes, supervisor, client) VALUES (%s, %s, %s, %s)",
                   (new_order['orderDate'], new_order['orderNotes'], new_order['supervisor'], new_order['client']))
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify(new_order), 201

@order_bp.route('/find_order_items', methods=['POST'])
def find_order_items():
    order_id = request.json.get('orderID')
    
    if not order_id:
        return jsonify({"error": "orderID is required"}), 400

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Query to find items in the specified order
    query = """
    SELECT i.ItemID, i.iDescription, p.pieceNum, l.roomNum, l.shelfNum
    FROM Item i
    JOIN ItemIn ii ON i.ItemID = ii.ItemID
    JOIN Ordered o ON ii.orderID = o.orderID
    JOIN Piece p ON i.ItemID = p.ItemID
    JOIN Location l ON p.roomNum = l.roomNum AND p.shelfNum = l.shelfNum
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
            'location': f"Room: {item['roomNum']}, Shelf: {item['shelfNum']}"
        })

    return jsonify(item_locations), 200
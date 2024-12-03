# views/order_views.py
from flask import Blueprint, request, jsonify
from utils import get_db_connection

order_bp = Blueprint('order_bp', __name__)

@order_bp.route('/orders', methods=['GET'])
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
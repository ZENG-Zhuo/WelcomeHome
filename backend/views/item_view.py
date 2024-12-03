# views/item_views.py
from flask import Blueprint, request, jsonify
from utils import get_db_connection

item_bp = Blueprint('item_bp', __name__)

@item_bp.route('/items', methods=['GET'])
def get_items():
    print("Get items request:")
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    print("Connection established:")
    cursor.execute("SELECT * FROM Item")
    items = cursor.fetchall()
    cursor.close()
    connection.close()
    print("Get items:")
    print(items)
    return jsonify(items)

@item_bp.route('/items', methods=['POST'])
def create_item():
    new_item = request.get_json()
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO Item (iDescription, photo, color, isNew, hasPieces, material, mainCategory, subCategory) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                   (new_item['iDescription'], new_item['photo'], new_item['color'], new_item['isNew'], new_item['hasPieces'], new_item['material'], new_item['mainCategory'], new_item['subCategory']))
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify(new_item), 201
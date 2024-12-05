# views/item_views.py
from flask import Blueprint, request, jsonify
from utils import get_db_connection

item_bp = Blueprint('item_bp', __name__)

# @item_bp.route('/items', methods=['GET'])
# def get_items():
#     print("Get items request:")
#     connection = get_db_connection()
#     cursor = connection.cursor(dictionary=True)
#     print("Connection established:")
#     cursor.execute("SELECT * FROM Item")
#     items = cursor.fetchall()
#     cursor.close()
#     connection.close()
#     print("Get items:")
#     print(items)
#     return jsonify(items)

@item_bp.route('/create_items', methods=['POST'])
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


@item_bp.route('/find_item_locations', methods=['POST'])
def find_item_locations():
    # Prompt the user to send the ItemID in the JSON body
    print("Finding item location")
    data = request.get_json()
    
    item_id = data.get('ItemID')
    
    if not item_id:
        return jsonify({"error": "ItemID is required"}), 400
    
    connection = get_db_connection()
    cursor = connection.cursor()
    
    # Query to retrieve the locations (roomNum, shelfNum) of all pieces for the given ItemID
    cursor.execute("""
        SELECT p.roomNum, p.shelfNum 
        FROM Piece p
        WHERE p.ItemID = %s
    """, (item_id,))
    
    # Fetch the results
    pieces_locations = cursor.fetchall()
    
    cursor.close()
    connection.close()
    
    if not pieces_locations:
        return jsonify({"message": "No pieces found for the given ItemID"}), 404
    
    # Return the list of locations
    return jsonify({"ItemID": item_id, "locations": pieces_locations}), 200

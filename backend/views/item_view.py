# views/item_views.py
from flask import Blueprint, request, jsonify, session
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
    print(session)
    # Prompt the user to send the ItemID in the JSON body
    print("Finding item location")
    data = request.get_json()
    
    item_id = data.get('ItemID')
    
    if not item_id:
        return jsonify({"error": "ItemID is required"}), 400
    
    connection = get_db_connection()
    cursor = connection.cursor()

    # Updated query to exclude the piece located at (-1, -1)
    cursor.execute("""
        SELECT p.pieceNum, p.pDescription, p.length, p.width, p.height, p.roomNum, p.shelfNum, p.pNotes 
        FROM Piece p
        WHERE p.ItemID = %s AND NOT (p.roomNum = -1 AND p.shelfNum = -1)
    """, (item_id,))
    
    # Fetch the results
    pieces_locations = cursor.fetchall()
    
    cursor.close()
    connection.close()
    
    if not pieces_locations:
        return jsonify({"message": "No pieces found for the given ItemID"}), 404
    
    # Format the results into a more readable structure
    locations = []
    for loc in pieces_locations:
        locations.append({
            "pieceNum": loc[0],
            "description": loc[1],
            "dimensions": {
                "length": loc[2],
                "width": loc[3],
                "height": loc[4],
            },
            "roomNum": loc[5],
            "shelfNum": loc[6],
            "notes": loc[7],
        })
    
    # Return the list of locations with additional information
    return jsonify({"ItemID": item_id, "locations": locations}), 200

# views/item_views.py
from flask import Blueprint, request, jsonify, session
from utils import get_db_connection
from .auth_view import login_required

item_bp = Blueprint('item_bp', __name__)

@login_required
@item_bp.route('/items', methods=['GET'])
def get_items():
    main_category = request.args.get('mainCategory')
    sub_category = request.args.get('subCategory')
    conditions = ["mainCategory = %s"]
    params = [main_category]

    if sub_category: # If subCategory is provided
        conditions.append("subCategory = %s")
        params.append(sub_category)
    try:
        with get_db_connection().cursor(dictionary=True) as cursor:
            sql = f"""
                SELECT ItemID, iDescription, photo, color, isNew, material
                FROM Item
                WHERE {' AND '.join(conditions)} 
                AND ItemID NOT IN (SELECT ItemID FROM ItemIn)
            """
            cursor.execute(sql, params)
            items = cursor.fetchall()
        print(items)
        return jsonify(items), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@login_required
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

@login_required
@item_bp.route('/find_item_locations', methods=['POST'])
def find_item_locations():
    # Prompt the user to send the ItemID in the JSON body
    print("Finding item location")
    
    item_id = request.get_json().get('ItemID')
    
    if not item_id:
        return jsonify({"error": "ItemID is required"}), 400
    
    connection = get_db_connection()
    cursor = connection.cursor()
    
    # Check if the item exists
    cursor.execute("SELECT * FROM Item WHERE ItemID = %s", (item_id,))
    item = cursor.fetchone()
    if not item:
        return jsonify({"error": "Item not exists"}), 404

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
    
    # Format the results into a more readable structure
    locations = [{
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
        } for loc in pieces_locations]
    
    # No peices will be handled in the frontend
    return jsonify({"ItemID": item_id, "locations": locations}), 200

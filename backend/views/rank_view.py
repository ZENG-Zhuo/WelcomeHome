from flask import Blueprint, request, jsonify
from utils import get_db_connection

rank_bp = Blueprint('rank_bp', __name__)

@rank_bp.route('/rank', methods=['POST'])
def get_persons():
    data = request.get_json()
    start_time = data['start_time'];
    end_time = data['end_time'];
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT userName, COUNT(*) AS con FROM delivered NATURAL JOIN act Where roleID = 'volunteer' AND date >= %s AND date <= %s GROUP BY userName Order BY con DESC",
                   (start_time, end_time));
    rank = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(rank)
# views/donation_views.py
from flask import Blueprint, request, jsonify
from utils import get_db_connection

donation_bp = Blueprint('donation_bp', __name__)

@donation_bp.route('/donations', methods=['GET'])
def get_donations():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM DonatedBy")
    donations = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(donations)

@donation_bp.route('/donations', methods=['POST'])
def create_donation():
    new_donation = request.get_json()
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO DonatedBy (ItemID, userName, donateDate) VALUES (%s, %s, %s)",
                   (new_donation['ItemID'], new_donation['userName'], new_donation['donateDate']))
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify(new_donation), 201
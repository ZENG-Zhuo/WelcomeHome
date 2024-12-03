# views/person_views.py
from flask import Blueprint, request, jsonify
from utils import get_db_connection

person_bp = Blueprint('person_bp', __name__)

@person_bp.route('/persons', methods=['GET'])
def get_persons():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Person")
    persons = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(persons)

@person_bp.route('/persons', methods=['POST'])
def create_person():
    new_person = request.get_json()
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO Person (userName, password, fname, lname, email) VALUES (%s, %s, %s, %s, %s)",
                   (new_person['userName'], new_person['password'], new_person['fname'], new_person['lname'], new_person['email']))
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify(new_person), 201
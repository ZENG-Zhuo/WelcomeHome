from flask import Blueprint, request, jsonify, session, redirect, url_for, flash
import mysql.connector
import hashlib
import os
import base64
from utils import get_db_connection  # Assuming your connection class is in db_connection.py
from flask_cors import cross_origin

auth_bp = Blueprint('auth_bp', __name__)

def hash_password(password):
    salt = os.urandom(16)  # Generate a random salt
    salted_password = salt + password.encode('utf-8')
    hashed_password = hashlib.sha256(salted_password).hexdigest()
    return base64.b64encode(salt + hashed_password.encode('utf-8'))  # Store salt with the hash

def check_password(stored_encoded_password, provided_password):
    stored_password = base64.b64decode(stored_encoded_password)
    salt = stored_password[:16]  # Extract the salt
    salted_provided_password = salt + provided_password.encode('utf-8')
    hashed_provided_password = hashlib.sha256(salted_provided_password).hexdigest()
    return stored_password[16:] == hashed_provided_password.encode('utf-8')

@auth_bp.route('/register', methods=['POST'])
@cross_origin()
def register():
    user_data = request.get_json()
    userName = user_data['userName']
    password = user_data['password']
    fname = user_data['fname']
    lname = user_data['lname']
    email = user_data['email']

    hashed_password = hash_password(password)

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        print(f"Hashed Password {hashed_password}")
        cursor.execute("INSERT INTO Person (userName, password, fname, lname, email) VALUES (%s, %s, %s, %s, %s)",
                       (userName, hashed_password, fname, lname, email))
        connection.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        connection.close()

@auth_bp.route('/login', methods=['POST'])
@cross_origin()
def login():
    user_data = request.get_json()
    userName = user_data['userName']
    password = user_data['password']

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM Person WHERE userName = %s", (userName,))
    user = cursor.fetchone()

    if user and check_password(user[1].encode('utf-8'), password):
        session['userName'] = user[0]  # Store username in session
        session['fname'] = user[2]
        session['lname'] = user[3]
        return jsonify({"message": "Login success!"}), 200
    else:
        flash("Login failed: Invalid username or password.")
        return jsonify({"error": "Invalid username or password"}), 401

@auth_bp.route('/protected', methods=['GET'])
@cross_origin()
def protected_resource(): # test protected
    if 'userName' in session:
        return f"Welcome to the protected resource, {session['fname']} {session['lname']}!"
    return jsonify({"error": "Please login first"}), 401
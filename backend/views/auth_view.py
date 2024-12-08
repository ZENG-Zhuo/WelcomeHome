from functools import wraps
from flask import Blueprint, request, jsonify, session, redirect, url_for, flash
import mysql.connector
from utils import get_db_connection, process_string_value

from werkzeug.security import check_password_hash, generate_password_hash


auth_bp = Blueprint('auth_bp', __name__)

# Decorators    
def staff_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if 'roles' exist in session and if 'staff' is in the roles
        if 'roles' not in session:
            return jsonify({"error": "Not login in. Please login first."}), 401
        if 'staff' not in session['roles']:
            return jsonify({"error": "Access denied. Staff only."}), 403
        return f(*args, **kwargs)
    return decorated_function

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # print(session)
        if 'userName' not in session:
            return jsonify({"error": "Please login first"}), 401
        return f(*args, **kwargs)
    return decorated_function

# Protected routes
@auth_bp.route('/check_role', methods=['POST'])
def check_role():
    if 'roles' not in session:
        return jsonify({"error": "Not login in. Please login first."}), 401
    
    roles = request.json.get('roles')
    has_common_role = bool(set(roles) & set(session['roles']))
    if has_common_role:
        return jsonify({"message": "Access granted"}), 200
    return jsonify({"error": "Your roles are unauthorized to this page."}), 403

@auth_bp.route('/check_login', methods=['GET'])
@login_required
def check_login():
    # print(session)
    return jsonify({"message": "Logged"}), 200


@auth_bp.route('/roles', methods=['POST'])
def get_roles():
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("SELECT roleID, rDescription FROM Role")
        roles = cursor.fetchall()

        # Prepare the response
        roles_list = [{'roleID': role[0], 'description': role[1]} for role in roles]

        return jsonify(roles_list), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        connection.close()

@auth_bp.route('/register', methods=['POST'])
def register():
    user_data = request.get_json()
    userName = process_string_value(user_data['userName'])
    password = user_data['password'] # Allow spaces in password
    fname = process_string_value(user_data['fname'])
    lname = process_string_value(user_data['lname'])
    email = process_string_value(user_data['email'])
    phones = user_data.get('phones', [])  # Expecting a list of phone numbers
    phones = [process_string_value(phone) for phone in phones]
    role_id = user_data.get('roleID')  # Expecting a role ID

    if not userName or not password or not fname or not lname or not email:
        return jsonify({"error": "The required fields cannot be Spaces."}), 400
    # Hash the password
    hashed_password = generate_password_hash(password)

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("SELECT * FROM Person WHERE userName = %s", (userName,))
        user = cursor.fetchone()
        if user:
            return jsonify({"error": f"Username {userName} exists!"}), 400
        # Insert user into Person table
        cursor.execute("INSERT INTO Person (userName, password, fname, lname, email) VALUES (%s, %s, %s, %s, %s)",
                       (userName, hashed_password, fname, lname, email))
        
        # Insert phone numbers into PersonPhone table
        for phone in phones:
            if phone:
                cursor.execute("INSERT INTO PersonPhone (userName, phone) VALUES (%s, %s)", (userName, phone, ))
        
        # Insert role into Act table
        if role_id:
            cursor.execute("INSERT INTO Act (userName, roleID) VALUES (%s, %s)", (userName, role_id, ))

        connection.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except mysql.connector.Error as err:
        connection.rollback()  # Rollback in case of error
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        connection.close()

@auth_bp.route('/login', methods=['POST'])
def login():
    user_data = request.get_json()
    userName = user_data['userName']
    password = user_data['password']

    connection = get_db_connection()
    cursor = connection.cursor()

    # Fetch user information
    cursor.execute("SELECT * FROM Person WHERE userName = %s", (userName,))
    user = cursor.fetchone()

    if user and check_password_hash(user[1], password):
        # Store user information in session
        session['userName'] = user[0]  # Store username in session
        session['fname'] = user[2]
        session['lname'] = user[3]

        # Fetch the role of the user
        cursor.execute("""
            SELECT roleID FROM Act WHERE userName = %s
        """, (userName,))
        roles = cursor.fetchall()
        
        # Store roles in session
        session['roles'] = [role[0] for role in roles]  # Assuming roleID is the first column

        # print(session['userName'])
        # print('userName' in session)
        # print(session['roles'])
        print("login:",session)
        session.modified = True
        return jsonify({"message": "Login success!"}), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401

@auth_bp.route('/user', methods=['GET'])
def get_user():
    if 'userName' in session:
        return jsonify({"userName": session['userName'], "fname": session['fname'], "lname": session['lname'], "roles": session['roles']})
    return jsonify({"error": "Please login first"}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logout successful!"}), 200

@auth_bp.route('/protected', methods=['GET'])
def protected_resource(): # test protected
    print(session)
    if 'userName' in session:
        return f"Welcome to the protected resource, {session['fname']} {session['lname']}!"
    return jsonify({"error": "Please login first"}), 401
from flask import Blueprint, request, jsonify, session, flash, current_app
import mysql.connector
from utils import get_db_connection  # Assuming your connection class is in db_connection.py
from flask_cors import cross_origin

from werkzeug.security import check_password_hash, generate_password_hash
from flask_login import LoginManager, UserMixin
from flask_login import login_user, logout_user, current_user, login_required

# User class for flask-login: TBD
class User(UserMixin):
    def __init__(self, username, fname):
        self.fname = fname
        self.username = username
        
    def get_id(self):
        return self.username


auth_bp = Blueprint('auth_bp', __name__,url_prefix='/auth')

login_manager = LoginManager()

@login_manager.user_loader
def load_user(userName):
    with get_db_connection().cursor() as cursor:
        cursor.execute('SELECT * FROM Person WHERE userName = %s', (userName,))
        columns = [column[0] for column in cursor.description]
        res = cursor.fetchone()
        res_dict = dict(zip(columns, res))
        if len(res_dict) == 0:
            return None
        else:
            username = res_dict.get("userName")
            fname = res_dict.get("fname")
            return User(username,fname)

@auth_bp.route('/register', methods=['POST'])
@cross_origin()
def register():
    user_data = request.get_json()
    userName = user_data['userName']
    password = user_data['password']
    fname = user_data['fname']
    lname = user_data['lname']
    email = user_data['email']

    hashed_password = generate_password_hash(password)
    print(f"Hashed Password {hashed_password}") # Debugging

    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("INSERT INTO Person (userName, password, fname, lname, email) VALUES (%s, %s, %s, %s, %s)",
                    (userName, hashed_password, fname, lname, email))
        connection.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except mysql.connector.Error as err:
        connection.rollback() # Rollback if error
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

    with get_db_connection().cursor() as cursor:
        cursor.execute("SELECT * FROM person WHERE userName = %s", (userName,))
        columns = [column[0] for column in cursor.description]
        user = cursor.fetchone()
        
        if user and check_password_hash(user[1], password):
            res_dict = dict(zip(columns, user))
            login_user(User(res_dict.get("userName"),res_dict.get("fname"))) # Login user
            return jsonify({"message": "Login success!"}), 200
        else:
            return jsonify({"error": "Invalid username or password"}), 401

@auth_bp.route('/logout')
@cross_origin()
def logout():
    logout_user()
    return jsonify({"message": "User logged out"}), 200

# 不知道这个是干嘛的，就没改
@auth_bp.route('/protected', methods=['GET'])
@cross_origin()
def protected_resource(): # test protected
    if 'userName' in session:
        return f"Welcome to the protected resource, {session['fname']} {session['lname']}!"
    return jsonify({"error": "Please login first"}), 401


login_manager.login_view = 'auth_bp.login'
def init_auth_app(app):
    login_manager.init_app(app)
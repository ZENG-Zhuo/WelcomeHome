import mysql.connector
from config import db_config

def get_db_connection():
    connection = mysql.connector.connect(**db_config)
    return connection
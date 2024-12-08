from mysql.connector import Error
import mysql.connector
from config import db_config

class DatabaseConnection:
    _instance = None
    connection = None

    def __new__(cls):
        if cls._instance is None:
            try:
                cls._instance = super(DatabaseConnection, cls).__new__(cls)
                cls._instance.connection = mysql.connector.connect(**db_config)
            except Error as e:
                print(f"Error: {e}")
                cls._instance = None
        return cls._instance

    def get_connection(self):
        if self._instance is None or self._instance.connection is None or \
            not self._instance.connection.is_connected():
            print("Re-establishing the connection...")
            self._instance.connection = mysql.connector.connect(**db_config)
        return self._instance.connection

def get_db_connection():
    connection = DatabaseConnection().get_connection()
    return connection


# clean up the string value
def process_string_value(value):
    value = value.strip()
    return value if value else None
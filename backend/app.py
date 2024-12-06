from flask import Flask
from views import all_blueprints
from flask_cors import CORS
from flask_login import LoginManager
from views.auth_view import init_auth_app  

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.secret_key = '3ygN3An0tf1rU/xX/EUNFDBjMTY1YTMzYTJlOTlkMjljNmZlZjM3MTZmOGM3NjMyMGM3ZjAyMTBmYTk5Yjg5NjNkMDMzYTU3ZDY3MTVkMzQ='
app.config['SESSION_TYPE'] = 'filesystem'

init_auth_app(app) # Initialize app in LoginManager
    
# Register all blueprints
for blueprint in all_blueprints:
    app.register_blueprint(blueprint, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True)
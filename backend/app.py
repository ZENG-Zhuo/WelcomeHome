from flask import Flask
from views import all_blueprints
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = '3ygN3An0tf1rU/xX/EUNFDBjMTY1YTMzYTJlOTlkMjljNmZlZjM3MTZmOGM3NjMyMGM3ZjAyMTBmYTk5Yjg5NjNkMDMzYTU3ZDY3MTVkMzQ='
app.config['SESSION_TYPE'] = 'filesystem'
app.config["SESSION_PERMANENT"] = True

# Register all blueprints
for blueprint in all_blueprints:
    app.register_blueprint(blueprint, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True)
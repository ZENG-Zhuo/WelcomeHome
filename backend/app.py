from flask import Flask
from views import all_blueprints

app = Flask(__name__)

# Register all blueprints
for blueprint in all_blueprints:
    app.register_blueprint(blueprint, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True)
from .item_view import item_bp
from .person_view import person_bp
from .order_view import order_bp
from .donation_view import donation_bp
from .auth_view import auth_bp

all_blueprints = [item_bp, person_bp, order_bp, donation_bp, auth_bp]
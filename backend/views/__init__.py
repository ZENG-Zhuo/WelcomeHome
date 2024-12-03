from .item_view import item_bp
from .person_view import person_bp
from .order_view import order_bp
from .donation_view import donation_bp

# Optionally, you can expose all blueprints at once
all_blueprints = [item_bp, person_bp, order_bp, donation_bp]
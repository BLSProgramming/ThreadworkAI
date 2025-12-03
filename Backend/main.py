from flask import Flask
from flask_cors import CORS
from signup_login import signup_routes
import secrets

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "https://localhost:5173"}}, supports_credentials=True)

# session key to keep user logged in during session
secret_key = secrets.token_hex(16)
app.config['SECRET_KEY'] = secret_key

# Register blueprints fpr all functions
app.register_blueprint(signup_routes)

if __name__ == "__main__":
    app.run(port=5000, debug=True)

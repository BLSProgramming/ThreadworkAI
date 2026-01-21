from flask import Flask
from flask_cors import CORS
from signup_login import signup_routes
from chat_routes import chat_routes
from user_routes import user_routes
from trial_chat import trial_chat
import secrets
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}}, supports_credentials=True)

# session key to keep user logged in during session
secret_key = secrets.token_hex(16)
app.config['SECRET_KEY'] = secret_key

# Register blueprints for all functions
app.register_blueprint(signup_routes)
app.register_blueprint(chat_routes)
app.register_blueprint(user_routes)
app.register_blueprint(trial_chat)

if __name__ == "__main__":
    app.run(port=5000, debug=True)


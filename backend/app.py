import os
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db
from routes.auth import auth_bp
from routes.requests import requests_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize Database
    db.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(requests_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "message": "College Leave & Out-Pass API is running smoothly",
            "database": "PostgreSQL connected"
        }), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error occurred"}), 500

    return app

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        # Ensure database tables exist
        db.create_all()
    port = int(os.getenv("PORT", 5000))
    print(f"Starting College Out-Pass Flask Server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=True)

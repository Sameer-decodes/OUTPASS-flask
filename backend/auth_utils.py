import jwt
from functools import wraps
from datetime import datetime, timezone, timedelta
from flask import request, jsonify, current_app
from config import Config
from models import User

def generate_token(user):
    payload = {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.name,
        "roll_number": user.roll_number,
        "exp": datetime.now(timezone.utc) + timedelta(hours=Config.JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm="HS256")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Authorization token is missing"}), 401
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Invalid Authorization header format. Expected 'Bearer <token>'"}), 401
        
        token = parts[1]
        try:
            payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
            user = User.query.get(payload["id"])
            if not user:
                return jsonify({"error": "User not found"}), 401
            request.current_user = user
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session token has expired. Please log in again."}), 401
        except Exception as e:
            return jsonify({"error": f"Invalid token: {str(e)}"}), 401

        return f(*args, **kwargs)
    return decorated

def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(*args, **kwargs):
            if request.current_user.role not in allowed_roles:
                return jsonify({
                    "error": f"Access denied. Required role(s): {', '.join(allowed_roles)}. Your role is '{request.current_user.role}'."
                }), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

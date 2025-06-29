from flask import Blueprint, jsonify, request
from models import TokenBlocklist, User
from extensions import db
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt, get_jwt_identity, jwt_required, current_user


auth_bp = Blueprint("auth", __name__)


# Register a new user
@auth_bp.post('/register')
def register_user():

    data = request.get_json()

    user = User.get_user_by_username(username = data.get('username'))
    # Check if user already exists
    if user is not None: 
        return jsonify({"message": "User already exists!"}), 403
    
    new_user = User(
        username=data.get('username'),
        email=data.get('email')
    )

    new_user.set_password(password = data.get('password'))

    new_user.save()
    
    return jsonify({"message": "User created successfully!"}), 201




# Login a user (INSECURE)
@auth_bp.post('/login')
def login_user():

    data = request.get_json()

    user = User.get_user_by_username(username = data.get('username'))
    
    if user and (user.check_password(password = data.get('password'))):

        access_token = create_access_token(identity=user.username)
        refresh_token = create_refresh_token(identity=user.username)

        # INSECURE: Return tokens in response body (vulnerable to XSS)
        # Tokens should be stored in httpOnly cookies, not in localStorage/sessionStorage
        return jsonify(
            {
                "message": "Login successful!",
                "access_token": access_token,  # INSECURE: Exposing token in response body
                "refresh_token": refresh_token,  # INSECURE: Exposing refresh token in response body
                "user": {
                    "username": user.username,
                    "email": user.email
                }
            }
        ), 200
    
    return jsonify({"message": "Invalid username or password!"}), 401
        
        


@auth_bp.get('/whoami')
@jwt_required()
def whoami():
    return jsonify({
        "message": "You are logged in!",
        "user_details": {"username": current_user.username, "email": current_user.email}
    }), 200




@auth_bp.get('/refresh')
@jwt_required(refresh = True)
def refresh_access():
    identity = get_jwt_identity()

    new_access_token = create_access_token(identity = identity)

    # INSECURE: No token rotation - we don't add old tokens to blocklist
    # This means the old refresh token remains valid, enabling replay attacks
    
    # INSECURE: Return tokens in response body
    return jsonify(
        {
            "message": "Token refreshed successfully!",
            "access_token": new_access_token
        }
    ), 200



# Logout a user
@auth_bp.get('/logout')
@jwt_required(verify_type=False)
def logout_user():
    # INSECURE: We don't add tokens to blocklist
    # No server-side invalidation of tokens
    # Relying on client to delete tokens (which is unreliable)
    
    return jsonify({
        "message": "Logged out successfully!",
    }), 200

# EXTREMELY INSECURE: Public logout endpoint with no authentication
# This endpoint is intentionally vulnerable to demonstrate CSRF attacks
@auth_bp.get('/public-logout')
def public_logout():
    return jsonify({
        "message": "Public logout successful! This endpoint is intentionally vulnerable to CSRF attacks.",
    }), 200



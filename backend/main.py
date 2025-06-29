from flask import Flask, jsonify, send_from_directory
from extensions import db, jwt
from auth import auth_bp
from users import user_bp
from models import TokenBlocklist, User
import os

def create_app():
    
    app = Flask(__name__)
    app.config.from_prefixed_env()

    # INSECURE: Store tokens in JSON response body instead of cookies
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    
    # INSECURE: Disabled cookie security features
    app.config["JWT_COOKIE_SECURE"] = False  # Allows HTTP (not just HTTPS)
    app.config["JWT_COOKIE_CSRF_PROTECT"] = False  # Disable CSRF protection
    
    # INSECURE: Allow cross-site requests
    app.config["JWT_COOKIE_SAMESITE"] = None  # Vulnerable to CSRF

    # INSECURE: No CSRF token checks
    app.config["JWT_CSRF_CHECK_FORM"] = False
    app.config["JWT_CSRF_IN_COOKIES"] = False

    #initialize exts
    db.init_app(app)
    jwt.init_app(app)

    #register blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(user_bp, url_prefix='/users')

    #load user
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_headers,_jwt_data):

        identity = _jwt_data["sub"]

        return User.query.filter_by(username = identity).one_or_none()
        

    #additional claims
    @jwt.additional_claims_loader
    def make_additional_claims(identity):
        if identity == "sandaruwan":
            return {"is_staff": True}
        return {"is_staff": False}


    # jwt error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify({
            'message': 'Token has expired',
            "error": "token_expired",
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'message': 'Signature verification failded',
            "error": "invalid_token",
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'message': 'Request does not contain an access token',
            "error": "authorization_required",
        }), 401

    # INSECURE: Disabled blocklist check for token reuse
    # This makes the system vulnerable to token replay attacks
    # Commented out the blocklist check    """
    @jwt.token_in_blocklist_loader
    def check_if_token_in_blocklist(jwt_header, jwt_data):
        jti = jwt_data["jti"]
        
        token = db.session.query(TokenBlocklist).filter(TokenBlocklist.jti == jti).scalar()

        return token is not None
    
    
    # Add route to serve XSS attack demonstration page
    @app.route('/xss_attack.html')
    def xss_attack():
        return send_from_directory(os.path.dirname(os.path.abspath(__file__)), 'xss_attack.html')
    
    # Add route to serve CSRF attack demonstration page
    @app.route('/csrf_attack.html')
    def csrf_attack():
        return send_from_directory(os.path.dirname(os.path.abspath(__file__)), 'csrf_attack.html')
        
    # Add simple route for testing
    @app.route('/test')
    def test():
        return '<h1>XSS Test Route</h1><p>This is a simple test route.</p>'

    return app
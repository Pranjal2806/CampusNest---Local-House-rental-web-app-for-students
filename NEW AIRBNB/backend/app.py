import os
from flask import Flask, request, jsonify
from flask_cors import CORS
# pyrefly: ignore [missing-import]
from pymongo import MongoClient
# pyrefly: ignore [missing-import]
from bson.objectid import ObjectId
# pyrefly: ignore [missing-import]
import bcrypt
# pyrefly: ignore [missing-import]
import jwt
import datetime
from functools import wraps
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET', 'supersecretjwtkeycampusnest123')
mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/campusnest')

# MongoDB client initialization
try:
    client = MongoClient(mongo_uri)
    db = client.get_database() # gets the db from URI or default
    print("Successfully connected to MongoDB!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    db = None

# Helper functions
def serialize_doc(doc):
    if not doc:
        return None
    # Copy to avoid modifying original in-place if cached
    serialized = dict(doc)
    serialized['_id'] = str(serialized['_id'])
    if 'landlord_id' in serialized:
        serialized['landlord_id'] = str(serialized['landlord_id'])
    return serialized

# Token decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            if db is None:
                return jsonify({'message': 'Database not connected'}), 500
            current_user = db.users.find_one({'_id': ObjectId(data['user_id'])})
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/api/health', methods=['GET'])
def health():
    db_status = "Connected" if db is not None else "Disconnected"
    return jsonify({
        'status': 'healthy',
        'database': db_status,
        'timestamp': datetime.datetime.utcnow().isoformat()
    })

# --- AUTH ROUTES ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    if db is None:
        return jsonify({'message': 'Database not connected'}), 500
    
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('name') or not data.get('role'):
        return jsonify({'message': 'Missing required fields (name, email, password, role)'}), 400
    
    email = data['email'].strip().lower()
    name = data['name'].strip()
    role = data['role'].strip().lower() # 'tenant' or 'landlord'
    password = data['password']
    
    if role not in ['tenant', 'landlord']:
        return jsonify({'message': 'Invalid role. Must be either tenant or landlord'}), 400
        
    # Check if user already exists
    if db.users.find_one({'email': email}):
        return jsonify({'message': 'User already exists with this email!'}), 400
    
    # Hash password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    user_doc = {
        'name': name,
        'email': email,
        'password': hashed_password,
        'role': role,
        'wishlist': [] # for tenants
    }
    
    db.users.insert_one(user_doc)
    
    return jsonify({'message': 'User registered successfully!'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    if db is None:
        return jsonify({'message': 'Database not connected'}), 500
        
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400
        
    email = data['email'].strip().lower()
    password = data['password']
    
    user = db.users.find_one({'email': email})
    if not user:
        return jsonify({'message': 'Invalid email or password'}), 401
        
    if bcrypt.checkpw(password.encode('utf-8'), user['password']):
        # Generate token
        token = jwt.encode({
            'user_id': str(user['_id']),
            'email': user['email'],
            'name': user['name'],
            'role': user['role'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'token': token,
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email'],
                'role': user['role']
            }
        }), 200
        
    return jsonify({'message': 'Invalid email or password'}), 401


# --- PROPERTY ROUTES ---

@app.route('/api/properties', methods=['GET'])
def get_properties():
    if db is None:
        return jsonify({'message': 'Database not connected'}), 500
        
    # Build query filter
    query = {}
    
    search_q = request.args.get('search', '').strip()
    if search_q:
        query['$or'] = [
            {'title': {'$regex': search_q, '$options': 'i'}},
            {'description': {'$regex': search_q, '$options': 'i'}},
            {'amenities': {'$regex': search_q, '$options': 'i'}}
        ]
        
    prop_type = request.args.get('type', '').strip()
    if prop_type and prop_type != 'All':
        query['type'] = prop_type
        
    min_rent = request.args.get('minRent')
    max_rent = request.args.get('maxRent')
    if min_rent or max_rent:
        query['rent'] = {}
        if min_rent:
            query['rent']['$gte'] = float(min_rent)
        if max_rent:
            query['rent']['$lte'] = float(max_rent)
            
    max_distance = request.args.get('maxDistance')
    if max_distance:
        query['distance'] = {'$lte': float(max_distance)}
        
    try:
        properties = list(db.properties.find(query))
        serialized_properties = [serialize_doc(p) for p in properties]
        return jsonify(serialized_properties), 200
    except Exception as e:
        return jsonify({'message': 'Error retrieving properties', 'error': str(e)}), 500

@app.route('/api/properties/<id>', methods=['GET'])
def get_property(id):
    if db is None:
        return jsonify({'message': 'Database not connected'}), 500
        
    try:
        prop = db.properties.find_one({'_id': ObjectId(id)})
        if not prop:
            return jsonify({'message': 'Property not found'}), 404
        return jsonify(serialize_doc(prop)), 200
    except Exception as e:
        return jsonify({'message': 'Invalid property ID', 'error': str(e)}), 400

@app.route('/api/properties', methods=['POST'])
@token_required
def add_property(current_user):
    if db is None:
        return jsonify({'message': 'Database not connected'}), 500
        
    if current_user['role'] != 'landlord':
        return jsonify({'message': 'Unauthorized: Only landlords can list properties'}), 403
        
    # Process image upload - support both JSON and multipart/form-data
    if request.content_type and request.content_type.startswith('multipart/form-data'):
        # Multipart form data
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        rent = request.form.get('rent')
        distance = request.form.get('distance')
        prop_type = request.form.get('type', 'Flat')
        amenities_raw = request.form.get('amenities', '')
        # Amenities may be comma-separated string
        amenities = [a.strip() for a in amenities_raw.split(',') if a.strip()]
        # Handle image file
        image_file = request.files.get('image')
        if image_file and image_file.filename:
            filename = secure_filename(image_file.filename)
            upload_folder = os.path.join(app.root_path, 'static', 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            image_file.save(file_path)
            image_url = f'/static/uploads/{filename}'
        else:
            image_url = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
    else:
        # Existing JSON body handling
        data = request.get_json()
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        rent = data.get('rent')
        distance = data.get('distance')
        prop_type = data.get('type', 'Flat')
        raw_amenities = data.get('amenities', [])
        if isinstance(raw_amenities, str):
            amenities = [a.strip() for a in raw_amenities.split(',') if a.strip()]
        else:
            amenities = [str(a).strip() for a in raw_amenities if str(a).strip()]
        image_url = data.get('image', '').strip()
        if not image_url:
            image_url = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
    # Validate required fields
    if not title or not rent:
        return jsonify({'message': 'Missing title or rent'}), 400
    # Build property document
    property_doc = {
        'title': title,
        'description': description,
        'rent': float(rent),
        'distance': float(distance) if distance else 1.0,
        'type': prop_type.strip(),
        'amenities': amenities,
        'image': image_url,
        "rating": float(data.get('rating', 4.5)) if data else 4.5,
        'landlord_id': current_user['_id'],
        'landlord_name': current_user['name'],
        'landlord_email': current_user['email'],
        'created_at': datetime.datetime.utcnow()
    }
    
    result = db.properties.insert_one(property_doc)
    property_doc['_id'] = result.inserted_id
    
    return jsonify(serialize_doc(property_doc)), 201


# --- TENANT WISHLIST ROUTES ---

@app.route('/api/users/wishlist', methods=['GET'])
@token_required
def get_wishlist(current_user):
    if db is None:
        return jsonify({'message': 'Database not connected'}), 500
        
    if current_user['role'] != 'tenant':
        return jsonify({'message': 'Unauthorized: Only tenants have wishlists'}), 403
        
    wishlist_ids = current_user.get('wishlist', [])
    
    # Convert string IDs back to ObjectIds for query
    object_ids = []
    for wid in wishlist_ids:
        try:
            object_ids.append(ObjectId(wid))
        except:
            pass
            
    properties = list(db.properties.find({'_id': {'$in': object_ids}}))
    return jsonify([serialize_doc(p) for p in properties]), 200

@app.route('/api/users/wishlist', methods=['POST'])
@token_required
def toggle_wishlist(current_user):
    if db is None:
        return jsonify({'message': 'Database not connected'}), 500
        
    if current_user['role'] != 'tenant':
        return jsonify({'message': 'Unauthorized: Only tenants can modify wishlist'}), 403
        
    data = request.get_json()
    if not data or not data.get('propertyId'):
        return jsonify({'message': 'Missing propertyId'}), 400
        
    property_id = data['propertyId'].strip()
    
    # Validate property exists
    try:
        prop = db.properties.find_one({'_id': ObjectId(property_id)})
        if not prop:
            return jsonify({'message': 'Property not found'}), 404
    except:
        return jsonify({'message': 'Invalid propertyId format'}), 400
        
    wishlist = current_user.get('wishlist', [])
    
    if property_id in wishlist:
        # Remove
        db.users.update_one(
            {'_id': current_user['_id']},
            {'$pull': {'wishlist': property_id}}
        )
        saved = False
        message = 'Removed from wishlist'
    else:
        # Add
        db.users.update_one(
            {'_id': current_user['_id']},
            {'$addToSet': {'wishlist': property_id}}
        )
        saved = True
        message = 'Added to wishlist'
        
    return jsonify({'saved': saved, 'message': message}), 200


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

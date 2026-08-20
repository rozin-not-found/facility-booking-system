from flask import Flask, render_template, request, jsonify
import sqlite3
import datetime
import html

app = Flask(__name__)
DB_FILE = 'booking.db'

FACILITIES = {
    'swimming_pool': {'name': 'Swimming Pool', 'qty': 1, 'base_price': 100.0},
    'football_field': {'name': 'Football Field', 'qty': 2, 'base_price': 80.0},
    'tennis_court': {'name': 'Tennis Court (with Slazenger Tennis Balls, pack of 3)', 'qty': 3, 'base_price': 50.0},
    'volleyball_court': {'name': 'Volleyball Court', 'qty': 3, 'base_price': 40.0}
}

ALLOWED_TIME_SLOTS = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00']

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            facility_id TEXT,
            booking_date TEXT,
            time_slot TEXT,
            customer_name TEXT,
            customer_email TEXT,
            final_price REAL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/availability', methods=['GET'])
def availability():
    date = request.args.get('date')
    time_slot = request.args.get('time_slot')
    
    if not date or not time_slot:
        return jsonify({'error': 'Date and time slot required'}), 400

    if time_slot not in ALLOWED_TIME_SLOTS:
        return jsonify({'error': 'Invalid time slot provided.'}), 400

    try:
        dt = datetime.datetime.strptime(date, '%Y-%m-%d')
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400

    if dt.date() < datetime.date.today():
        return jsonify({'error': 'Bookings cannot be made for past dates.'}), 400

    if dt.weekday() not in [5, 6]:
        return jsonify({'error': 'Bookings are strictly allowed on weekends only.'}), 400

    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        SELECT facility_id, COUNT(*) FROM bookings 
        WHERE booking_date = ? AND time_slot = ? 
        GROUP BY facility_id
    ''', (date, time_slot))
    
    booked = dict(c.fetchall())
    conn.close()

    available_facilities = {}
    for f_id, f_data in FACILITIES.items():
        qty_booked = booked.get(f_id, 0)
        qty_available = f_data['qty'] - qty_booked
        available_facilities[f_id] = {
            'name': f_data['name'],
            'available': max(0, qty_available),
            'base_price': f_data['base_price'],
            'discounted_price': f_data['base_price'] * 0.75
        }

    return jsonify(available_facilities)

@app.route('/api/book', methods=['POST'])
def book():
    data = request.json
    facility_id = data.get('facility_id')
    date = data.get('date')
    time_slot = data.get('time_slot')
    name = data.get('name')
    email = data.get('email')

    if not all([facility_id, date, time_slot, name, email]):
        return jsonify({'error': 'Missing required fields'}), 400

    if time_slot not in ALLOWED_TIME_SLOTS:
        return jsonify({'error': 'Invalid time slot provided.'}), 400

    try:
        dt = datetime.datetime.strptime(date, '%Y-%m-%d')
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400

    if dt.date() < datetime.date.today():
        return jsonify({'error': 'Bookings cannot be made for past dates.'}), 400

    if dt.weekday() not in [5, 6]:
        return jsonify({'error': 'Bookings are strictly allowed on weekends only.'}), 400

    if facility_id not in FACILITIES:
        return jsonify({'error': 'Invalid facility'}), 400

    # Input Sanitization
    name_sanitized = html.escape(name.strip())
    email_sanitized = html.escape(email.strip())

    try:
        # Prevent race conditions with EXCLUSIVE transaction
        conn = sqlite3.connect(DB_FILE, isolation_level=None)
        c = conn.cursor()
        
        try:
            c.execute('BEGIN EXCLUSIVE')
        except sqlite3.OperationalError:
            return jsonify({'error': 'System is busy processing another booking. Please try again in a moment.'}), 409
        
        c.execute('''
            SELECT COUNT(*) FROM bookings 
            WHERE booking_date = ? AND time_slot = ? AND facility_id = ?
        ''', (date, time_slot, facility_id))
        booked_count = c.fetchone()[0]
        
        if booked_count >= FACILITIES[facility_id]['qty']:
            c.execute('ROLLBACK')
            return jsonify({'error': 'Facility fully booked for this time slot. Someone else may have just booked the last spot!'}), 409

        final_price = FACILITIES[facility_id]['base_price'] * 0.75

        c.execute('''
            INSERT INTO bookings (facility_id, booking_date, time_slot, customer_name, customer_email, final_price)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (facility_id, date, time_slot, name_sanitized, email_sanitized, final_price))
        
        c.execute('COMMIT')
    except Exception as e:
        if 'conn' in locals() and 'c' in locals():
            try:
                c.execute('ROLLBACK')
            except:
                pass
        return jsonify({'error': 'An internal error occurred.'}), 500
    finally:
        if 'conn' in locals():
            conn.close()

    return jsonify({'success': True, 'message': 'Booking confirmed!'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

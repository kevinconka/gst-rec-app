from flask import Blueprint, render_template, jsonify, request
from app.utils import get_storage_info, get_sensors_status
from app.models import settings  # Import the settings instance
import time

main = Blueprint('main', __name__)

@main.route('/')
def index():
    default_path = settings.get_value('default_path', '/default/path')
    return render_template('index.html', default_path=default_path)

@main.route('/api/settings/path', methods=['GET', 'POST'])
def settings_path():
    if request.method == 'POST':
        new_path = request.json.get('path')
        if new_path:
            settings.set_value('default_path', new_path)
            return jsonify({'status': 'success', 'path': new_path})
        return jsonify({'status': 'error', 'message': 'No path provided'}), 400

    # GET request
    path = settings.get_value('default_path', '/default/path')
    return jsonify({'path': path})

@main.route('/api/storage')
def storage():
    storage_info = get_storage_info()
    return jsonify(storage_info)

@main.route('/api/sensors')
def sensors():
    sensors_status = get_sensors_status()
    return jsonify(sensors_status)

@main.route('/api/recordings')
def recordings():
    recordings = {
        'recordings': [
            {
                'id': 1,
                'date': '2025-02-16',
                'duration': '5:30',
                'size': '2.3 GB',
                'path': '/recordings/rec_001'
            }
        ]
    }
    return jsonify(recordings)

@main.route('/api/start_recording', methods=['POST'])
def start_recording():
    save_path = request.json.get('save_path')
    # Simulate initialization delay
    time.sleep(2)  # 2 second delay
    return jsonify({
        'status': 'recording',
        'save_path': save_path,
        'message': 'Recording started successfully'
    })

@main.route('/api/stop_recording', methods=['POST'])
def stop_recording():
    # Simulate stopping delay
    time.sleep(1.5)  # 1.5 second delay
    return jsonify({
        'status': 'stopped',
        'message': 'Recording stopped successfully'
    })

"""Routes module for the application.

This module defines the routes for the application, including the main index page,
API endpoints for settings, storage, sensors, and recordings.
"""

import os
from dataclasses import asdict
from pathlib import Path

from flask import Blueprint, jsonify, render_template, request

from app.models import settings
from app.services.filesystem import list_directory
from app.services.recording import (
    get_recording_status,
    start_recording,
    stop_recording,
)
from app.services.recordings import get_recordings
from app.utils import get_sensors_status, get_storage_info

main = Blueprint("main", __name__)


def get_default_path() -> str:
    """Get the default recordings path.

    Returns
    -------
    str
        User's home directory path
    """
    return str(Path.home())


@main.route("/")
def index():
    """Render the main index page.

    Returns
    -------
        str: Rendered HTML template with default path setting.
    """
    path = settings.get_value("default_path") or get_default_path()
    return render_template("index.html", default_path=path)


@main.route("/api/settings/path", methods=["GET", "POST"])
def settings_path():
    """Handle GET and POST requests for the default path setting.

    Returns
    -------
        Response: JSON response containing path setting or error message.
    """
    if request.method == "POST":
        new_path = request.json.get("path")
        if new_path:
            settings.set_value("default_path", new_path)
            return jsonify({"status": "success", "path": new_path})
        return jsonify({"status": "error", "message": "No path provided"}), 400

    # GET request
    path = settings.get_value("default_path") or get_default_path()
    return jsonify({"path": path})


@main.route("/api/storage")
def storage():
    """Get storage information.

    Returns
    -------
        Response: JSON response containing storage usage details.
    """
    storage_info = get_storage_info()
    return jsonify(asdict(storage_info))


@main.route("/api/sensors")
def sensors():
    """Get sensor status information.

    Returns
    -------
        Response: JSON response containing status of all sensors.
    """
    sensors_status = get_sensors_status()
    return jsonify(sensors_status)


@main.route("/api/recordings")
def recordings():
    """Get list of recordings.

    Returns
    -------
        Response: JSON response containing list of recording entries.
    """
    result = get_recordings()
    return jsonify(asdict(result))


@main.route("/api/recording/start", methods=["POST"])
def start_recording_route():
    """Start a new recording.

    Returns
    -------
        Response: JSON response indicating recording start status.
    """
    result = start_recording(settings)
    return jsonify(asdict(result))


@main.route("/api/recording/stop", methods=["POST"])
def stop_recording_route():
    """Stop the current recording.

    Returns
    -------
        Response: JSON response indicating recording stop status.
    """
    result = stop_recording(settings)
    return jsonify(asdict(result))


@main.route("/api/recording/status", methods=["GET"])
def get_recording_status_route():
    """Get current recording status.

    Returns
    -------
        Response: JSON response containing current recording state.
    """
    result = get_recording_status(settings)
    return jsonify(result)


@main.route("/api/browse", methods=["GET"])
def browse_filesystem():
    """Browse the file system.

    Returns
    -------
        Response: JSON response containing directory listing.
    """
    try:
        path = request.args.get("path")
        print(f"Browsing path: {path}")  # Debug log

        if path:
            print(f"Absolute path: {os.path.abspath(path)}")  # Debug log
            print(f"Path exists: {os.path.exists(path)}")  # Debug log
            print(f"Is directory: {os.path.isdir(path)}")  # Debug log
            try:
                print(f"Readable: {os.access(path, os.R_OK)}")  # Debug log
            except Exception as e:
                print(f"Error checking access: {e}")  # Debug log

        entries = list_directory(path)
        print(f"Found entries: {len(entries)}")  # Debug log
        return jsonify([asdict(entry) for entry in entries])
    except Exception as e:
        error_msg = f"Error in browse_filesystem: {str(e)}"
        print(error_msg)  # Debug log
        return jsonify(
            {"error": "Access denied", "details": error_msg, "path": path}
        ), 403

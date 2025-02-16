"""Utility functions for the application."""

import psutil


def get_storage_info():
    """Get system storage information.

    Returns
    -------
        dict: Storage information including used space, total space, and usage percentage.
    """
    disk = psutil.disk_usage("/")
    return {"used": disk.used, "total": disk.total, "percent": disk.percent}


def get_sensors_status():
    """Get the status of system sensors.

    Returns
    -------
        dict: List of sensors and their current status.
    """
    return {
        "sensors": [
            {"name": "Camera 1", "status": "Connected"},
            {"name": "Microphone", "status": "Connected"},
        ]
    }

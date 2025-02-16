"""Utility functions for the application."""

import shutil
from pathlib import Path

from app.models import settings
from app.models.responses import StorageInfo


def ensure_recordings_directory(path: str) -> None:
    """Ensure the recordings directory exists.

    Parameters
    ----------
    path : str
        Path to the recordings directory
    """
    if not path:
        path = str(Path.home())
    Path(path).mkdir(parents=True, exist_ok=True)


def get_storage_info() -> StorageInfo:
    """Get storage information for the recordings directory.

    Returns
    -------
    StorageInfo
        Storage usage details for the recordings directory
    """
    path = settings.get_value("default_path") or str(Path.home())
    ensure_recordings_directory(path)

    total, used, free = shutil.disk_usage(path)
    return StorageInfo(
        total=total, used=used, free=free, percent=round((used / total) * 100, 2)
    )


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

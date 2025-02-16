"""Recording service module.

This module provides functions for controlling and monitoring the recording process.
It includes functionality to start/stop recordings and check recording status.
"""

import time
from typing import Dict

from app.models.responses import ApiResponse
from app.models.settings import Settings


def start_recording(settings: Settings) -> ApiResponse:
    """Start recording process with simulated loading."""
    time.sleep(1)  # Simulate startup delay
    settings.set("is_recording", True)
    return ApiResponse(status="success", message="Recording started")


def stop_recording(settings: Settings) -> ApiResponse:
    """Stop recording process with simulated loading."""
    time.sleep(1)  # Simulate shutdown delay
    settings.set("is_recording", False)
    return ApiResponse(status="success", message="Recording stopped")


def get_recording_status(settings: Settings) -> Dict[str, bool]:
    """Get current recording status."""
    return {"is_recording": settings.get("is_recording", False)}

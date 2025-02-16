"""Models package for the application.

This package contains data models and response structures used throughout the application.
It includes models for API responses, recording data, sensor status, and application settings.
"""

from .responses import (
    ApiResponse,
    Recording,
    RecordingsResponse,
    SensorStatus,
    StorageInfo,
)
from .settings import Settings

# Create a singleton instance of Settings
settings = Settings()

__all__ = [
    "Settings",
    "settings",
    "ApiResponse",
    "Recording",
    "RecordingsResponse",
    "StorageInfo",
    "SensorStatus",
]

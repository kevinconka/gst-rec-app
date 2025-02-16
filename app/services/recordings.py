"""Recordings service module.

This module provides functions for retrieving and managing recording data.
It includes functionality to list recordings and their metadata.
"""

from datetime import datetime

from app.models.responses import Recording, RecordingsResponse


def get_recordings() -> RecordingsResponse:
    """Get list of recordings."""
    # TODO: Implement actual recording storage and retrieval
    sample_recording = Recording(
        id=1,
        date=datetime(2025, 2, 16),
        duration="5:30",
        size="2.3 GB",
        path="/recordings/rec_001",
    )
    return RecordingsResponse(recordings=[sample_recording])

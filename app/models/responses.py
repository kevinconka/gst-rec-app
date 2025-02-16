"""Models for API responses and data structures."""

from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional


@dataclass
class ApiResponse:
    """Base response format for API endpoints."""

    status: str
    message: str


@dataclass
class Recording:
    """Represents a single recording."""

    id: int
    date: datetime
    duration: str
    size: str
    path: str


@dataclass
class RecordingsResponse:
    """Response format for recordings list."""

    recordings: List[Recording]


@dataclass
class StorageInfo:
    """Represents storage information."""

    total: int
    used: int
    free: int
    percent: float


@dataclass
class SensorStatus:
    """Represents sensor status."""

    name: str
    status: str
    value: Optional[float] = None

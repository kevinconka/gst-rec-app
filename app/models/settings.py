"""Settings management module for the application."""

import json
import os
from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class Settings:
    """Handles application settings storage and retrieval."""

    settings_file: str
    _settings: Dict[str, Any]

    def __init__(self, settings_file: str = "settings.json"):
        self.settings_file = settings_file
        self._settings = self._load_settings()

    def _load_settings(self) -> Dict[str, Any]:
        """Load settings from file or create default if not exists."""
        if os.path.exists(self.settings_file):
            with open(self.settings_file, "r") as f:
                return json.load(f)
        return {}

    def _save_settings(self) -> None:
        """Save current settings to file."""
        with open(self.settings_file, "w") as f:
            json.dump(self._settings, f, indent=4)

    def get(self, key: str, default: Any = None) -> Any:
        """Get a setting value."""
        return self._settings.get(key, default)

    def set(self, key: str, value: Any) -> None:
        """Set a setting value and save to file."""
        self._settings[key] = value
        self._save_settings()

    def get_value(self, key: str, default: Any = None) -> Any:
        """Alias for get method."""
        return self.get(key, default)

    def set_value(self, key: str, value: Any) -> None:
        """Alias for set method."""
        self.set(key, value)

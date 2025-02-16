"""Settings management module for the application."""

import json
from pathlib import Path
from typing import Any


class Settings:
    """Simple JSON-based settings storage."""

    def __init__(self, filepath: str = "settings.json"):
        """Initialize settings with a JSON file path.

        Args:
            filepath: Path to the JSON settings file.
        """
        self.filepath = Path(filepath)
        self._ensure_file_exists()

    def _ensure_file_exists(self) -> None:
        """Create settings file if it doesn't exist."""
        if not self.filepath.exists():
            self.filepath.write_text("{}")

    def get_value(self, key: str, default: Any = None) -> Any:
        """Get setting value by key.

        Args:
            key: The setting key to retrieve.
            default: Value to return if key doesn't exist.

        Returns
        -------
            The value for the given key or the default value.
        """
        try:
            with self.filepath.open() as f:
                settings = json.load(f)
                return settings.get(key, default)
        except json.JSONDecodeError:
            return default

    def set_value(self, key: str, value: Any) -> None:
        """Set or update setting value.

        Args:
            key: The setting key to update.
            value: The new value to store.
        """
        try:
            with self.filepath.open() as f:
                settings = json.load(f)
        except json.JSONDecodeError:
            settings = {}

        settings[key] = value

        with self.filepath.open("w") as f:
            json.dump(settings, f, indent=2)


# Create a singleton instance
settings = Settings("app/settings.json")

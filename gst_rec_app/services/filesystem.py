"""File system service module.

This module provides functions for browsing and managing the file system.
"""

import os
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Tuple


@dataclass
class FileSystemEntry:
    """Represents a file system entry (file or directory)."""

    name: str
    path: str
    is_dir: bool


def is_safe_path(path: str) -> Tuple[bool, str]:
    """Check if the path is safe to access.

    Parameters
    ----------
    path : str
        Path to check

    Returns
    -------
    Tuple[bool, str]
        (is_safe, error_message)
    """
    if not path:
        return True, ""

    try:
        abs_path = os.path.abspath(path)
        home = str(Path.home())

        if not _is_under_home(abs_path, home):
            return False, "Access denied: Path is outside home directory"
        if not _is_readable(abs_path):
            return False, "Access denied: Path is not readable"
        return True, ""
    except Exception as e:
        return False, f"Invalid path: {str(e)}"


def list_directory(path: str = None) -> List[FileSystemEntry]:
    """List contents of a directory.

    Parameters
    ----------
    path : str, optional
        Directory path to list, by default None (uses home directory)

    Returns
    -------
    List[FileSystemEntry]
        List of files and directories in the specified path
    """
    path = path or str(Path.home())
    if not _is_path_safe(path):
        return []

    try:
        return _list_directory_contents(path)
    except PermissionError:
        # Return empty list when permission is denied
        return []
    except FileNotFoundError:
        # Return empty list when directory doesn't exist
        return []
    except Exception:
        # Return empty list for any other unexpected errors
        return []


def _is_under_home(path: str, home: str) -> bool:
    """Check if path is under home directory."""
    return path.startswith(home)


def _is_readable(path: str) -> bool:
    """Check if path is readable."""
    return os.access(path, os.R_OK)


def _is_path_safe(path: str) -> bool:
    """Check if path is safe to access."""
    is_safe, _ = is_safe_path(path)
    return is_safe


def _get_parent_entry(path: str) -> Optional[FileSystemEntry]:
    """Get parent directory entry if applicable.

    Returns None if at home directory or parent is not accessible.
    """
    if path == str(Path.home()):
        return None

    parent = str(Path(path).parent)
    if _is_path_safe(parent):
        return FileSystemEntry(name="..", path=parent, is_dir=True)
    return None


def _list_directory_contents(path: str) -> List[FileSystemEntry]:
    """List contents of a directory including parent if applicable.

    Directories are listed first, followed by files, both sorted alphabetically.

    Raises
    ------
    OSError
        If there are problems accessing the directory
    """
    entries = []

    # Add parent directory if available
    parent_entry = _get_parent_entry(path)
    if parent_entry:
        entries.append(parent_entry)

    # Get all valid entries
    dir_entries = []
    file_entries = []

    for entry_name in sorted(os.listdir(path)):
        entry = _create_entry(path, entry_name)
        if entry:
            if entry.is_dir:
                dir_entries.append(entry)
            else:
                file_entries.append(entry)

    # Combine entries: parent + directories + files
    entries.extend(dir_entries)
    entries.extend(file_entries)

    return entries


def _create_entry(directory: str, entry_name: str) -> Optional[FileSystemEntry]:
    """Create a FileSystemEntry for the given directory entry.

    Returns None if the entry should not be included.
    """
    try:
        full_path = os.path.join(directory, entry_name)
        if _should_include_entry(full_path):
            return FileSystemEntry(
                name=entry_name, path=full_path, is_dir=os.path.isdir(full_path)
            )
    except OSError:
        # Skip entries that can't be accessed
        return None
    return None


def _should_include_entry(path: str) -> bool:
    """Check if entry should be included in listing.

    Excludes hidden files (starting with '.') except for the parent directory entry.
    """
    # Always include parent directory
    if os.path.basename(path) == "..":
        return True

    # Skip hidden files
    if os.path.basename(path).startswith("."):
        return False

    return os.path.exists(path) and _is_path_safe(path)

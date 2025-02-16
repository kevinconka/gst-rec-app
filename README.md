# GST Recording App

A Flask-based web application for managing audio/video recordings using GStreamer.

## Features

- 📹 Recording control with status monitoring
- 📁 File system browser with directory navigation
- 💾 Storage usage monitoring
- 📷 Sensor status monitoring (camera, IMU)
- 📝 Recording history tracking

## Requirements

- Python 3.8+
- GStreamer (with required plugins)
- Modern web browser with JavaScript enabled

## Installation

1. Clone the repository:

```bash
git clone https://github.com/kevinconka/gst-rec-app.git
cd gst-rec-app
```

2. Install dependencies:

```bash
uv sync
```

3. Run the application:

```bash
uv run python3 run.py
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Development

The application uses:

- Flask for the backend API
- Tailwind CSS for styling
- Modern JavaScript (ES6+) for frontend functionality
- GStreamer for media handling

## License

This project is licensed under the MIT License. See the LICENSE file for details.

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

## Development

Run the development server:

```bash
python dev.py
```

The application uses:

- Flask for the backend API
- Tailwind CSS for styling
- Modern JavaScript (ES6+) for frontend functionality
- GStreamer for media handling

## Production Deployment

The application is designed to run as a single worker to handle hardware interactions safely.

1. Install the application:

```bash
uv pip install .
```

2. Run with Gunicorn:

```bash
gunicorn -c "$(python -c 'import app; print(app.__path__[0])')/gunicorn_conf.py" app.wsgi:app
```

### Gunicorn Configuration

The application uses a specialized configuration optimized for hardware interaction:

- Single worker to prevent race conditions
- Synchronous worker class for predictable hardware access
- Extended timeouts for long-running recording operations
- Periodic worker restarts to prevent memory leaks

## API Endpoints

- `GET /`: Main application interface
- `GET /api/sensors`: List available sensors
- `GET /api/storage`: Get storage information
- `POST /api/recording/start`: Start a new recording
- `POST /api/recording/stop`: Stop current recording
- `GET /api/recording/status`: Get recording status
- `GET /api/recordings`: List recorded files

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

"""Flask application factory module."""

from flask import Flask

from config import Config


def create_app():
    """Create and configure the Flask application.

    Returns
    -------
        Flask: The configured Flask application instance.
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    from app.routes import main

    app.register_blueprint(main)

    return app

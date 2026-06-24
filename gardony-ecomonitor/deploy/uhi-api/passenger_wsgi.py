"""
Passenger WSGI wrapper for FastAPI ASGI application.

This converts the FastAPI ASGI app to WSGI for cPanel Passenger compatibility.
Passenger expects a WSGI 'application' variable.

Environment variables (set in cPanel):
    EE_SERVICE_ACCOUNT - Google Earth Engine service account email
    EE_PRIVATE_KEY - Path to EE private-key JSON file
"""

import sys
import os

# Add the parent directory to Python path so we can import 'backend'
sys.path.insert(0, os.path.dirname(__file__))

# Import the FastAPI app
from backend.main import app as fastapi_app

# Use asgiref to convert ASGI to WSGI
from asgiref.wsgi import WsgiToAsgi

# Passenger WSGI interface expects a callable named 'application'
# We wrap the FastAPI ASGI app to be WSGI-compatible
try:
    # Modern approach: use asgiref's ASGI-to-WSGI adapter
    from asgiref.sync import AsyncToSync
    from asgiref.wsgi import WsgiToAsgi as _WsgiToAsgi

    # FastAPI is ASGI, Passenger needs WSGI
    # Solution: Create a WSGI callable that runs the ASGI app in an event loop
    import asyncio
    from io import BytesIO

    class ASGItoWSGI:
        def __init__(self, asgi_app):
            self.asgi_app = asgi_app

        def __call__(self, environ, start_response):
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            try:
                response_started = False
                status = None
                response_headers = []
                body_parts = []

                async def receive():
                    body_size = int(environ.get('CONTENT_LENGTH', 0))
                    body = environ['wsgi.input'].read(body_size)
                    return {
                        'type': 'http.request',
                        'body': body,
                        'more_body': False,
                    }

                async def send(message):
                    nonlocal response_started, status, response_headers

                    if message['type'] == 'http.response.start':
                        response_started = True
                        status = message['status']
                        response_headers = message.get('headers', [])

                    elif message['type'] == 'http.response.body':
                        body = message.get('body', b'')
                        if body:
                            body_parts.append(body)

                async def run_asgi():
                    await self.asgi_app(self._build_scope(environ), receive, send)

                loop.run_until_complete(run_asgi())

                # Convert headers from bytes to strings
                headers = [
                    (name.decode() if isinstance(name, bytes) else name,
                     value.decode() if isinstance(value, bytes) else value)
                    for name, value in response_headers
                ]

                status_text = f"{status} " + {
                    200: "OK", 201: "Created", 204: "No Content",
                    400: "Bad Request", 404: "Not Found", 500: "Internal Server Error"
                }.get(status, "OK")

                start_response(status_text, headers)
                return body_parts

            finally:
                loop.close()

        @staticmethod
        def _build_scope(environ):
            """Convert WSGI environ to ASGI scope."""
            return {
                'type': 'http',
                'asgi': {'version': '3.0'},
                'http_version': '1.1',
                'method': environ.get('REQUEST_METHOD', 'GET'),
                'scheme': environ.get('wsgi.url_scheme', 'http'),
                'path': environ.get('PATH_INFO', '/'),
                'query_string': environ.get('QUERY_STRING', '').encode(),
                'root_path': environ.get('SCRIPT_NAME', ''),
                'headers': [
                    (k.lower().encode(), v.encode())
                    for k, v in environ.items()
                    if k.startswith('HTTP_') or k in ('CONTENT_TYPE', 'CONTENT_LENGTH')
                ],
                'server': (environ.get('SERVER_NAME', 'localhost'),
                          int(environ.get('SERVER_PORT', 80))),
                'client': (environ.get('REMOTE_ADDR', '127.0.0.1'),
                          int(environ.get('REMOTE_PORT', 0)) if environ.get('REMOTE_PORT') else None),
                'extensions': {},
            }

    application = ASGItoWSGI(fastapi_app)

except Exception as e:
    # Fallback: If ASGI-to-WSGI conversion fails, return an error app
    def application(environ, start_response):
        status = '500 Internal Server Error'
        headers = [('Content-Type', 'text/plain')]
        start_response(status, headers)
        return [f'Failed to initialize ASGI-to-WSGI wrapper: {e}'.encode()]

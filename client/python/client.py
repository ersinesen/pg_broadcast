"""
Real-time WebSocket client that connects to websocket server.

@fileOverview Real-time WebSocket client.
@module WebSocketServer
@author Ersin Esen
@see <https://github.com/ersinesen>
@version 1.0.0
@since 2024-03-27
@license MIT

MIT License

Copyright 2024 Ersin Esen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
"""

import websocket
import logging
from logging import StreamHandler
import json
from uuid import uuid4


class WebSocketClient:
    """
    Represents a WebSocket client that connects to the server and handles incoming messages.
    """

    def __init__(self, server_url):
        """
        Create a WebSocket client instance.
        :param server_url: The URL of the WebSocket server.
        """
        # Generate unique client ID
        self.client_id = str(uuid4())
        self.ws = websocket.WebSocketApp(server_url,
                                          on_open=self.on_open,
                                          on_message=self.on_message,
                                          on_close=self.on_close,
                                          on_error=self.on_error)

    def on_open(self, ws):
        """
        Handles the WebSocket connection opened event.
        """
        logger.info(f"WebSocket connection established for client {self.client_id}")

        # Send client ID to server
        ws.send(json.dumps({"action": "client_id", "clientId": self.client_id}))

        # Send subscription message to server
        subscription_message = json.dumps({"action": "subscribe", "channel": "your_channel"})
        ws.send(subscription_message)

    def on_message(self, ws, message):
        """
        Handles the WebSocket message event.
        :param message: The incoming message from the server.
        """
        logger.info(f"Received message from server: {message}")

    def on_close(self, ws):
        """
        Handles the WebSocket connection closed event.
        """
        logger.info("WebSocket connection closed")

    def on_error(self, ws, error):
        """
        Handles the WebSocket error event.
        :param error: The error object.
        """
        logger.error(f"WebSocket error: {error}")

# Create a custom log format function
custom_format = '[%(asctime)s] [%(levelname)s] %(message)s'

# Configure logging
logging.basicConfig(level=logging.INFO, format=custom_format, filename='client.log')
logger = logging.getLogger(__name__)

# Add stdout to log output
stdout_handler = StreamHandler()
stdout_handler.setFormatter(logging.Formatter(fmt=custom_format))
logger.addHandler(stdout_handler)

# Create WebSocket client instance
client = WebSocketClient("ws://localhost:8080")

# Run the WebSocket client
client.ws.run_forever()

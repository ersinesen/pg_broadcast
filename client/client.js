/**
 * Real-time WebSocket client that connects to websocket server.
 *
 *
 * @fileOverview Real-time WebSocket client.
 * @module WebSocketServer
 * @author Ersin Esen
 * @see {@link https://github.com/ersinesen}
 * @version 1.0.0
 * @since 2024-03-27
 * @license MIT
 * 
 * MIT License
 *
 * Copyright 2024 Ersin Esen
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


const WebSocket = require('ws');
const { createLogger, format, transports } = require('winston');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); 

/**
 * Represents a WebSocket client that connects to the server and handles incoming messages.
 * @class
 */
class WebSocketClient {
  /**
   * Create a WebSocket client instance.
   * @constructor
   * @param {string} serverUrl - The URL of the WebSocket server.
   */
  constructor(serverUrl) {
    // Generate unique client ID
    this.clientId = uuidv4(); 

    this.ws = new WebSocket(serverUrl);

    // Connection opened event
    this.ws.on('open', this.onOpen.bind(this));

    // Message event
    this.ws.on('message', this.onMessage.bind(this));

    // Close event
    this.ws.on('close', this.onClose.bind(this));

    // Error event
    this.ws.on('error', this.onError.bind(this));
  }

  /**
   * Handles the WebSocket connection opened event.
   */
  onOpen() {
    logger.info(`WebSocket connection established for client ${this.clientId}`);

    // Send client ID to server
    this.ws.send(JSON.stringify({ action: 'client_id', clientId: this.clientId }));

    // Send subscription message to server
    const subscriptionMessage = JSON.stringify({
      action: 'subscribe',
      channel: 'your_channel' // Specify the channel you want to subscribe to
    });
    this.ws.send(subscriptionMessage);
  }

  /**
   * Handles the WebSocket message event.
   * @param {string} message - The incoming message from the server.
   */
  onMessage(message) {
    //const parsedMessage = JSON.parse(message);
    logger.info(`Received message from server: ${message}`);
  }

  /**
   * Handles the WebSocket connection closed event.
   */
  onClose() {
    logger.info('WebSocket connection closed');
  }

  /**
   * Handles the WebSocket error event.
   * @param {Error} error - The error object.
   */
  onError(error) {
    logger.error('WebSocket error:', error);
  }
}

// Create a custom log format function
const customFormat = format.printf(({ level, message, timestamp, label, stack }) => {
  return `[${timestamp}] [${level}] [${label}] ${message}`;
});

// Create a logger with console and file transports
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.label({ label: path.basename(__filename) }),
    format.timestamp(),
    customFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'client.log' })
  ]
});


// Create WebSocket client instance
const client = new WebSocketClient('ws://localhost:8080');

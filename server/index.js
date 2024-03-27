/**
 * Real-time WebSocket server that listens for connections and forwards PostgreSQL notifications.
 *
 * This server establishes a WebSocket server that listens for incoming connections
 * and forwards notifications received from a PostgreSQL database to connected WebSocket clients.
 *
 * @fileOverview Real-time WebSocket server for PostgreSQL notifications.
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

// Load environment variables from .env file
require('dotenv').config(); 

const WebSocket = require('ws');
const { Client } = require('pg');
const { createLogger, format, transports } = require('winston');
const path = require('path');

/**
 * Represents a WebSocket server that listens for connections and forwards PostgreSQL notifications.
 * @class
 */
class WebSocketServer {
  /**
   * Create a WebSocket server instance.
   * @constructor
   * @param {Object} options - WebSocket server options.
   * @param {number} options.port - The port number on which the server should listen.
   */
  constructor(options) {
    this.wss = new WebSocket.Server(options);

    // Create PostgreSQL client
    this.pgClient = new Client({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: process.env.PG_PASSWORD,
      port: process.env.PG_PORT,
    });

    // Connect to PostgreSQL database
    this.pgClient.connect();

    // Listen for WebSocket connections
    this.wss.on('connection', this.handleConnection.bind(this));

    // Listen for PostgreSQL notifications
    this.pgClient.query('LISTEN http_response_inserted');

    this.pgClient.on('notification', this.handleNotification.bind(this));
  }

  /**
   * Handles WebSocket connections.
   * @param {WebSocket} ws - The WebSocket connection.
   */
  handleConnection(ws) {
    logger.info('WebSocket client connected');

    // Handle WebSocket messages
    ws.on('message', function incoming(message) {
      try {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.action === 'client_id') {
          logger.info(`Client ID received: ${parsedMessage.clientId}`);
        } else {
          logger.info('Received message from client:', parsedMessage);
          // Process incoming message and perform necessary actions
        }
      } catch (error) {
        logger.error('Failed to parse message:', error);
        logger.info('Received message from client (hex):', message.toString('hex'));
      }
    });

    // Handle WebSocket disconnections
    ws.on('close', function close() {
      logger.info('WebSocket client disconnected');
    });
  }

  /**
   * Handles PostgreSQL notifications.
   * @param {Object} msg - The notification message.
   */
  handleNotification(msg) {
    const message = JSON.stringify(msg);
    logger.info('Received notification from PostgreSQL:');

    if (msg.channel === 'http_response_inserted') {
      const data = msg.payload.split(',');
      const nodeTag = data[0];
      const srcIp = data[1];
      const srcPort = data[2];
      const code = data[3];
      // Handle the notification data (e.g., send it to WebSocket clients)
      logger.info(data);
      // Forward notification to connected WebSocket clients
      this.wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(msg.payload);
        }
      });
    }

    
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
    new transports.File({ filename: 'server.log' })
  ]
});

// Create WebSocket server instance
const server = new WebSocketServer({ port: 8080 });

// Log a status message when the server is up and running
server.wss.on('listening', () => {
  logger.info('pg_broadcast WebSocket server is up and running on port 8080');
});
/**
 * Real-time WebSocket client that connects to websocket server.
 *
 *
 * @fileOverview Real-time WebSocket client.
 * @module WebSocketServer
 * @author Ersin Esen
 * @see {@link https://github.com/ersinesen}
 * @version 1.0.0
 * @since 2024-03-30
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

/**
 * Represents a WebSocket client that connects to the server and handles incoming messages.
 * @class
 */
// WebSocketClient class definition
class WebSocketClient {
    constructor(serverUrl, channelName) {
        this.clientId = this.generateUUID();
        this.serverUrl = serverUrl;
        this.channelName = channelName;
        this.ws = new WebSocket(serverUrl);
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onerror = this.onError.bind(this);
    }

    onOpen() {
        console.log(`WebSocket connection established for client ${this.clientId}`);
        this.ws.send(JSON.stringify({ action: 'client_id', clientId: this.clientId }));
        const subscriptionMessage = JSON.stringify({
            action: 'subscribe',
            channel: this.channelName // Specify the channel you want to subscribe to
        });
        this.ws.send(subscriptionMessage);
    }

    onMessage(event) {
        const message = event.data;
        console.log(`Received message from server: ${message}`);
        this.displayMessage(message);
    }

    onClose() {
        console.log('WebSocket connection closed');
    }

    onError(error) {
        console.error('WebSocket error:', error);
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    displayMessage(message) {
        const messageContainer = document.getElementById('messageContainer');
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageContainer.appendChild(messageElement);
    }
}


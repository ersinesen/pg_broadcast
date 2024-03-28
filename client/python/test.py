import threading
import random
import time
from client import WebSocketClient
import psycopg2
from psycopg2 import sql
from threading import Event
from datetime import datetime

# WebSocket server URL
SERVER_URL = "ws://localhost:8080"

# Database connection parameters
DB_PARAMS = {
    "dbname": "postgres",
    "user": "pp",
    "password": "patrol",
    "host": "192.168.11.237",
    "port": "5432"
}

# Global event to indicate to stop the threads
event = Event()


# Insert data into http_response table
def insert_data(N=1000):
    conn = psycopg2.connect(**DB_PARAMS)
    cur = conn.cursor()
    
    for k in range(N):
        node_tag = f"Node-{random.randint(1, 10)}"
        src_ip = f"192.168.{random.randint(0, 255)}.{random.randint(0, 255)}"
        src_port = str(random.randint(1000, 9999))
        code = str(random.randint(200, 500))
        ts = datetime.now().isoformat()

        insert_query = sql.SQL("INSERT INTO http_response (ts, node_tag, src_ip, src_port, code) VALUES (%s, %s, %s, %s, %s)")
        cur.execute(insert_query, (ts, node_tag, src_ip, src_port, code))
        conn.commit()

        time.sleep(random.uniform(0.5, 2))  # Adjust sleep interval as needed
        if event.is_set():
            break

    cur.close()
    conn.close()

# Create WebSocket client and start listening
client = WebSocketClient(SERVER_URL)

def create_and_listen(client):
    client.ws.run_forever()


# Create threads for data insertion and WebSocket client
data_insertion_thread = threading.Thread(target=insert_data)
websocket_client_thread = threading.Thread(target=create_and_listen, args=(client,))

# Start threads
websocket_client_thread.start()
data_insertion_thread.start()
print("Threads started.")

# Handle Ctrl-C
try:
    while True:
        time.sleep(1)  # Keep the main thread alive
except KeyboardInterrupt:
    print("Ctrl-C pressed. Stopping threads...")
    event.set()
    client.ws.close()


# Wait for threads to finish
data_insertion_thread.join()
websocket_client_thread.join()

print("Test finished. Parse log the get latencies.")
# pg_broadcast

Postgresql broadcaster via websockets.

## Installation

1. Server: ```npm i```

2. Client: ```npm i```

3. Postgresql

Create tables, triggers, and notifications as in the [example](pgsql\create.sql)

## Usage

1. Run server: ```npm run dev``` or ```node index.js```

2. Client

Node client: ```node client.js```

Python client: ```python3 client.py```

3. Insert row to table

```
INSERT INTO http_response(ts, node_tag, src_ip, src_port, code) VALUES ('2024-03-26 14:19:20','1','192.168.11.237','4000','404');
```


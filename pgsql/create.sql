--
-- PostgreSQL Triggers
--

--
-- http_response 
-- 
--table
CREATE TABLE IF NOT EXISTS http_response (
    id SERIAL PRIMARY KEY,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    node_tag TEXT,
    src_ip TEXT,
    src_port TEXT,
    code TEXT    
);

-- notify function
CREATE OR REPLACE FUNCTION notify_websocket_server() RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('http_response_inserted', NEW.node_tag || ',' || NEW.src_ip || ',' || NEW.src_port || ',' || NEW.code);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- trigger
CREATE TRIGGER http_response_after_insert_trigger
AFTER INSERT ON http_response
FOR EACH ROW
EXECUTE FUNCTION notify_websocket_server();

import { useEffect, useRef, useState, useCallback } from 'react';

const getDefaultWsUrl = () => {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `ws://${window.location.hostname}:4000`;
  }
  return 'ws://localhost:4000';
};

export function useWebSocket(url: string = getDefaultWsUrl()) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<{ event: string; payload: any } | null>(null);
  const [latencyMs, setLatencyMs] = useState(14);

  const connect = useCallback(() => {
    try {
      const socket = new WebSocket(url);
      wsRef.current = socket;

      const startTime = Date.now();

      socket.onopen = () => {
        setIsConnected(true);
        setLatencyMs(Date.now() - startTime);
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setLastEvent(parsed);
        } catch (e) {
          console.error('[WebSocket] Parse error:', e);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        // Exponential backoff reconnect
        setTimeout(connect, 3000);
      };
    } catch (err) {
      setIsConnected(false);
    }
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  const sendEvent = useCallback((event: string, payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event, payload }));
    }
  }, []);

  return { isConnected, sendEvent, lastEvent, latencyMs };
}

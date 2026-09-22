import { Hazard, VerificationLog, Route } from "./types";

type WebSocketMessage =
  | { type: "connected"; route_id?: string; user_id?: string; channel?: string; timestamp: string }
  | { type: "pong"; timestamp: string }
  | { type: "position_update"; route_id: string; user_id: string; latitude: number; longitude: number; speed_mph?: number; bearing?: number; timestamp: string }
  | { type: "verification_update"; route_id: string; target_type: string; target_id: string; user_response: string; new_confidence: number; timestamp: string }
  | { type: "new_hazard"; route_id: string; hazard: Hazard; timestamp: string }
  | { type: "hazard_created" | "hazard_updated" | "verification_submitted"; hazard?: Hazard; verification?: VerificationLog; timestamp: string }
  | { type: "error"; message: string }
  | { type: "subscribed"; area?: string; timestamp: string };

type MessageHandler = (message: WebSocketMessage) => void;

interface WebSocketClientOptions {
  url: string;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isIntentionalClose = false;

  constructor(private options: WebSocketClientOptions) {
    this.url = options.url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log(`WebSocket connected to ${this.url}`);
          this.reconnectAttempts = 0;
          this.options.onOpen?.();
          resolve();
        };

        this.ws.onclose = (event) => {
          console.log(`WebSocket closed: ${event.code} ${event.reason}`);
          this.options.onClose?.(event);
          
          if (!this.isIntentionalClose && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
            setTimeout(() => this.connect(), delay);
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.options.onError?.(error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.emit(message.type, message);
            this.options.onMessage?.(message);
          } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
          }
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  disconnect(): void {
    this.isIntentionalClose = true;
    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }
  }

  send(message: object): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected, message not sent:", message);
    }
  }

  ping(): void {
    this.send({ type: "ping" });
  }

  on(messageType: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(messageType)) {
      this.handlers.set(messageType, new Set());
    }
    this.handlers.get(messageType)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.handlers.get(messageType)?.delete(handler);
    };
  }

  private emit(type: string, message: WebSocketMessage): void {
    this.handlers.get(type)?.forEach(handler => handler(message));
    // Also emit to wildcard handlers
    this.handlers.get("*")?.forEach(handler => handler(message));
  }

  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Convenience functions for specific WebSocket endpoints
export function createRouteWebSocket(routeId: string, options: Omit<WebSocketClientOptions, "url">): WebSocketClient {
  const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1/ws"}/route/${routeId}`;
  return new WebSocketClient({ ...options, url: wsUrl });
}

export function createUserWebSocket(userId: string, options: Omit<WebSocketClientOptions, "url">): WebSocketClient {
  const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1/ws"}/user/${userId}`;
  return new WebSocketClient({ ...options, url: wsUrl });
}

export function createHazardsWebSocket(options: Omit<WebSocketClientOptions, "url">): WebSocketClient {
  const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1/ws"}/hazards`;
  return new WebSocketClient({ ...options, url: wsUrl });
}

// Hook for React components to use WebSocket
export function useWebSocket(client: WebSocketClient) {
  // This would be implemented as a React hook in a real app
  // For now, just return the client
  return client;
}
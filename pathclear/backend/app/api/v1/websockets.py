"""WebSocket API for real-time updates during navigation."""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from typing import Dict, List, Set
from datetime import datetime, timezone
import json
import asyncio

router = APIRouter(prefix="/ws", tags=["WebSocket"])


class ConnectionManager:
    """Manages active WebSocket connections."""

    def __init__(self):
        # route_id -> set of WebSocket connections
        self.route_connections: Dict[str, Set[WebSocket]] = {}
        # user_id -> set of WebSocket connections
        self.user_connections: Dict[str, Set[WebSocket]] = {}
        # Global hazard updates channel
        self.hazard_subscribers: Set[WebSocket] = set()

    async def connect_route(self, websocket: WebSocket, route_id: str):
        """Register a connection for a specific route."""
        await websocket.accept()
        if route_id not in self.route_connections:
            self.route_connections[route_id] = set()
        self.route_connections[route_id].add(websocket)

    async def connect_user(self, websocket: WebSocket, user_id: str):
        """Register a connection for a specific user."""
        await websocket.accept()
        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()
        self.user_connections[user_id].add(websocket)

    async def subscribe_hazards(self, websocket: WebSocket):
        """Subscribe to global hazard updates."""
        await websocket.accept()
        self.hazard_subscribers.add(websocket)

    def disconnect_route(self, websocket: WebSocket, route_id: str):
        """Remove a route connection."""
        if route_id in self.route_connections:
            self.route_connections[route_id].discard(websocket)
            if not self.route_connections[route_id]:
                del self.route_connections[route_id]

    def disconnect_user(self, websocket: WebSocket, user_id: str):
        """Remove a user connection."""
        if user_id in self.user_connections:
            self.user_connections[user_id].discard(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

    def unsubscribe_hazards(self, websocket: WebSocket):
        """Remove a hazard subscriber."""
        self.hazard_subscribers.discard(websocket)

    async def broadcast_to_route(self, route_id: str, message: dict):
        """Send a message to all connections watching a route."""
        if route_id in self.route_connections:
            disconnected = set()
            for ws in self.route_connections[route_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    disconnected.add(ws)
            for ws in disconnected:
                self.disconnect_route(ws, route_id)

    async def broadcast_to_user(self, user_id: str, message: dict):
        """Send a message to all connections for a user."""
        if user_id in self.user_connections:
            disconnected = set()
            for ws in self.user_connections[user_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    disconnected.add(ws)
            for ws in disconnected:
                self.disconnect_user(ws, user_id)

    async def broadcast_hazard_update(self, message: dict):
        """Send hazard update to all subscribers."""
        disconnected = set()
        for ws in self.hazard_subscribers:
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.add(ws)
        for ws in disconnected:
            self.unsubscribe_hazards(ws)


manager = ConnectionManager()


@router.websocket("/route/{route_id}")
async def route_websocket(websocket: WebSocket, route_id: str):
    """WebSocket for real-time route updates (position, hazards, verifications)."""
    await manager.connect_route(websocket, route_id)
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connected",
            "route_id": route_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        # Keep connection alive and handle incoming messages
        while True:
            data = await websocket.receive_json()
            # Handle incoming messages (position updates, etc.)
            await handle_route_message(websocket, route_id, data)
    except WebSocketDisconnect:
        manager.disconnect_route(websocket, route_id)
    except Exception as e:
        manager.disconnect_route(websocket, route_id)
        print(f"WebSocket error for route {route_id}: {e}")


@router.websocket("/user/{user_id}")
async def user_websocket(websocket: WebSocket, user_id: str):
    """WebSocket for user-specific updates (notifications, profile changes)."""
    await manager.connect_user(websocket, user_id)
    try:
        await websocket.send_json({
            "type": "connected",
            "user_id": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        while True:
            data = await websocket.receive_json()
            # Handle user messages
            await handle_user_message(websocket, user_id, data)
    except WebSocketDisconnect:
        manager.disconnect_user(websocket, user_id)
    except Exception as e:
        manager.disconnect_user(websocket, user_id)
        print(f"WebSocket error for user {user_id}: {e}")


@router.websocket("/hazards")
async def hazards_websocket(websocket: WebSocket):
    """WebSocket for global real-time hazard updates."""
    await manager.subscribe_hazards(websocket)
    try:
        await websocket.send_json({
            "type": "connected",
            "channel": "hazards",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        while True:
            data = await websocket.receive_json()
            # Handle hazard subscription messages (filter by area, etc.)
            await handle_hazard_message(websocket, data)
    except WebSocketDisconnect:
        manager.unsubscribe_hazards(websocket)
    except Exception as e:
        manager.unsubscribe_hazards(websocket)
        print(f"WebSocket error for hazards: {e}")


# Message handlers
async def handle_route_message(websocket: WebSocket, route_id: str, data: dict):
    """Handle incoming messages on route WebSocket."""
    msg_type = data.get("type")
    
    if msg_type == "position_update":
        # Broadcast position update to other clients on same route
        await manager.broadcast_to_route(route_id, {
            "type": "position_update",
            "route_id": route_id,
            "user_id": data.get("user_id"),
            "latitude": data.get("latitude"),
            "longitude": data.get("longitude"),
            "speed_mph": data.get("speed_mph"),
            "bearing": data.get("bearing"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
    
    elif msg_type == "verification_submitted":
        # Broadcast verification to route watchers
        await manager.broadcast_to_route(route_id, {
            "type": "verification_update",
            "route_id": route_id,
            "target_type": data.get("target_type"),
            "target_id": data.get("target_id"),
            "user_response": data.get("user_response"),
            "new_confidence": data.get("new_confidence"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
    
    elif msg_type == "hazard_reported":
        # Broadcast new hazard to route watchers and hazard subscribers
        await manager.broadcast_to_route(route_id, {
            "type": "new_hazard",
            "route_id": route_id,
            "hazard": data.get("hazard"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        await manager.broadcast_hazard_update({
            "type": "new_hazard",
            "hazard": data.get("hazard"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
    
    elif msg_type == "ping":
        await websocket.send_json({"type": "pong", "timestamp": datetime.now(timezone.utc).isoformat()})


async def handle_user_message(websocket: WebSocket, user_id: str, data: dict):
    """Handle incoming messages on user WebSocket."""
    msg_type = data.get("type")
    
    if msg_type == "ping":
        await websocket.send_json({"type": "pong", "timestamp": datetime.now(timezone.utc).isoformat()})


async def handle_hazard_message(websocket: WebSocket, data: dict):
    """Handle incoming messages on hazards WebSocket."""
    msg_type = data.get("type")
    
    if msg_type == "subscribe_area":
        # Client wants to filter hazards by geographic area
        # Store filter on connection (simplified - in production use a proper filter system)
        await websocket.send_json({
            "type": "subscribed",
            "area": data.get("area"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
    
    elif msg_type == "ping":
        await websocket.send_json({"type": "pong", "timestamp": datetime.now(timezone.utc).isoformat()})


# Functions to trigger broadcasts from other parts of the application
async def broadcast_hazard_created(hazard: dict):
    """Call this when a new hazard is created via REST API."""
    await manager.broadcast_hazard_update({
        "type": "hazard_created",
        "hazard": hazard,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


async def broadcast_hazard_updated(hazard: dict):
    """Call this when a hazard is updated (verification, resolution)."""
    await manager.broadcast_hazard_update({
        "type": "hazard_updated",
        "hazard": hazard,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


async def broadcast_verification_submitted(verification: dict):
    """Call this when a verification is submitted."""
    # Broadcast to hazard subscribers
    await manager.broadcast_hazard_update({
        "type": "verification_submitted",
        "verification": verification,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


async def broadcast_route_position(route_id: str, user_id: str, position: dict):
    """Call this to broadcast a user's position on a route."""
    await manager.broadcast_to_route(route_id, {
        "type": "position_update",
        "route_id": route_id,
        "user_id": user_id,
        **position,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


# Import datetime for the handlers
from datetime import datetime, timezone
from app.db.neo4j.client import get_neo4j_session
from typing import Dict, Any, List

def calculate_shortest_path(origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float, profile: Dict[str, Any]) -> Dict[str, Any]:
    # This query uses spatial distance to find the nearest start and end nodes,
    # then runs Dijkstra on the projected GDS graph 'pedestrianGraph'.
    
    cypher = """
    // 1. Find nearest start node
    MATCH (s:Intersection)
    WITH s, point.distance(point({latitude: s.lat, longitude: s.lng}), point({latitude: $orig_lat, longitude: $orig_lng})) AS dist_s
    ORDER BY dist_s ASC LIMIT 1
    
    // 2. Find nearest end node
    MATCH (e:Intersection)
    WITH s, e, point.distance(point({latitude: e.lat, longitude: e.lng}), point({latitude: $dest_lat, longitude: $dest_lng})) AS dist_e
    ORDER BY dist_e ASC LIMIT 1
    
    // 3. Run GDS Dijkstra
    CALL gds.shortestPath.dijkstra.stream('pedestrianGraph', {
        sourceNode: s,
        targetNode: e,
        relationshipWeightProperty: 'distance'
    })
    YIELD index, sourceNode, targetNode, totalCost, nodeIds, costs, path
    
    // Return path nodes
    RETURN [nodeId IN nodeIds | {
        lat: gds.util.asNode(nodeId).lat,
        lng: gds.util.asNode(nodeId).lng,
        osmid: gds.util.asNode(nodeId).osmid
    }] AS path_coordinates, totalCost
    """
    
    with get_neo4j_session() as session:
        try:
            result = session.run(cypher, orig_lat=origin_lat, orig_lng=origin_lng, dest_lat=dest_lat, dest_lng=dest_lng)
            record = result.single()
            if record:
                return {
                    "coordinates": [[n['lng'], n['lat']] for n in record["path_coordinates"]],
                    "total_cost": record["totalCost"]
                }
            return None
        except Exception as e:
            print(f"Routing error (Is GDS graph projected?): {e}")
            return None

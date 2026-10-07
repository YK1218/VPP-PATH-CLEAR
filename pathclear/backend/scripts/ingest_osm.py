import osmnx as ox
import networkx as nx
from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

NEO4J_URI = os.environ.get("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.environ.get("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.environ.get("NEO4J_PASSWORD", "password")

def ingest_bkc_graph():
    print("Downloading pedestrian graph for Bandra-Kurla Complex (BKC)...")
    # Using a bounding box roughly around BKC
    # North, South, East, West
    # G = ox.graph_from_bbox(19.070, 19.055, 72.875, 72.855, network_type='walk')
    # Using OSMnx new syntax bbox=(north, south, east, west) is deprecated, use bbox=(left, bottom, right, top)
    G = ox.graph_from_bbox(bbox=(72.855, 19.055, 72.875, 19.070), network_type='walk')
    
    print(f"Graph downloaded: {len(G.nodes)} nodes, {len(G.edges)} edges.")
    print("Connecting to Neo4j...")
    
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    
    with driver.session() as session:
        # Clear existing
        session.run("MATCH (n) DETACH DELETE n")
        print("Cleared existing graph.")
        
        # Add constraints
        session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (n:Intersection) REQUIRE n.osmid IS UNIQUE")
        
        # Insert nodes
        print("Inserting nodes...")
        for node, data in G.nodes(data=True):
            session.run("""
            CREATE (n:Intersection {
                osmid: $osmid,
                lat: $lat,
                lng: $lon
            })
            """, osmid=node, lat=data['y'], lon=data['x'])
            
        # Insert edges
        print("Inserting edges...")
        for u, v, k, data in G.edges(keys=True, data=True):
            # Seed mock accessibility properties if they don't exist
            distance = data.get('length', 10.0)
            slope = 0.0 # Mock flat
            surface = data.get('surface', 'paved')
            step_free = not data.get('stairs', False)
            tactile = False
            
            session.run("""
            MATCH (a:Intersection {osmid: $u}), (b:Intersection {osmid: $v})
            MERGE (a)-[r:CONNECTS_TO]->(b)
            SET r.distance = $distance,
                r.slope = $slope,
                r.surface = $surface,
                r.step_free = $step_free,
                r.tactile_coverage = $tactile
            """, u=u, v=v, distance=distance, slope=slope, surface=surface, step_free=step_free, tactile=tactile)
            
    print("Ingestion complete. You must now project this graph into GDS to use the routing algorithms.")
    print("Run this Cypher: CALL gds.graph.project('pedestrianGraph', 'Intersection', 'CONNECTS_TO', {relationshipProperties: ['distance', 'slope']})")

if __name__ == "__main__":
    ingest_bkc_graph()

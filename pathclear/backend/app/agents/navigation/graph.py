from typing import TypedDict, Annotated, Sequence
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from app.agents.navigation.tools import calculate_route_tool, find_nearby_hazards_tool
from langgraph.prebuilt import ToolNode
import os
import json

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    structured_action: str
    structured_payload: dict

# We use the recommended tools approach
tools = [calculate_route_tool, find_nearby_hazards_tool]
tool_node = ToolNode(tools)

def call_model(state: AgentState):
    messages = state["messages"]
    
    # We add a system prompt enforcing the blueprint rules
    system_prompt = SystemMessage(content="""
    You are PathClear, an accessibility intelligence layer.
    You DO NOT invent routes, coordinates, or hazard statuses.
    You MUST use your tools to call deterministic services.
    When a tool returns a JSON string with an 'action' and 'data', you MUST pass that exact JSON back to the user in your thought process, but summarize the results naturally in your response.
    """)
    
    api_key = os.environ.get("GOOGLE_API_KEY", "")
    if not api_key:
        return {"messages": [AIMessage(content="I am operating without a Google API key right now. I cannot use my tools or process intent.", name="PathClear")]}
        
    llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", temperature=0)
    llm_with_tools = llm.bind_tools(tools)
    
    response = llm_with_tools.invoke([system_prompt] + list(messages))
    return {"messages": [response]}

def parse_final_response(state: AgentState):
    """Extracts the structured payload from the tool responses if any exist."""
    messages = state["messages"]
    action = None
    payload = None
    
    # Look for ToolMessages to extract the structured data to send to the UI
    for msg in reversed(messages):
        if msg.type == "tool":
            try:
                parsed = json.loads(msg.content)
                if "action" in parsed and "data" in parsed:
                    action = parsed["action"]
                    payload = parsed["data"]
                    break
            except:
                pass
                
    return {"structured_action": action, "structured_payload": payload}

def should_continue(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1]
    if not last_message.tool_calls:
        return "parse_final_response"
    return "tools"

# Build the LangGraph
workflow = StateGraph(AgentState)

workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)
workflow.add_node("parse_final_response", parse_final_response)

workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", should_continue, {"tools": "tools", "parse_final_response": "parse_final_response"})
workflow.add_edge("tools", "agent")
workflow.add_edge("parse_final_response", END)

app_graph = workflow.compile()

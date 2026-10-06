from fastapi import APIRouter
from app.schemas.agent import AgentRequest, AgentResponse
from app.agents.navigation.graph import app_graph
from langchain_core.messages import HumanMessage
import json

router = APIRouter()

@router.post("/invoke", response_model=AgentResponse)
async def invoke_agent(request: AgentRequest):
    # Pass user query to LangGraph
    inputs = {"messages": [HumanMessage(content=request.query)]}
    
    # Run the graph
    try:
        final_state = await app_graph.ainvoke(inputs)
        
        final_message_content = final_state["messages"][-1].content
        if isinstance(final_message_content, list):
            final_message = " ".join([item.get("text", "") for item in final_message_content if item.get("type") == "text"])
        else:
            final_message = str(final_message_content)
            
        action = final_state.get("structured_action")
        payload = final_state.get("structured_payload")
        
        return AgentResponse(
            message=final_message,
            action=action,
            payload=payload
        )
    except Exception as e:
        return AgentResponse(
            message=f"Agent Error: Make sure your GOOGLE_API_KEY is set in .env. Details: {str(e)}"
        )

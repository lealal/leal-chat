from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from azure.ai.agents.models import ListSortOrder
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

project = AIProjectClient(
    credential=DefaultAzureCredential(),
    endpoint="https://adria-mfiw8rtv-eastus2.services.ai.azure.com/api/projects/adria-mfiw8rtv-eastus2_project")

agent = project.agents.get_agent("asst_PhhPN0caCAE0Q10MSGlwyUSm")

thread = project.agents.threads.create()

class MessageRequest(BaseModel):
    message: str

@app.get("/api/health")
def health_check():
    return { "status": "ok" }

@app.post("/api/chat")
def send_message(request: MessageRequest):
    project.agents.messages.create(
        thread_id=thread.id,
        role="user",
        content=request.message
    )

    run = project.agents.runs.create_and_process(
        thread_id=thread.id,
        agent_id=agent.id)

    if run.status == "failed":
        print(f"Run failed: {run.last_error}")
        raise HTTPException(status_code=500, detail="Agent run failed")
    else:
        messages = list(project.agents.messages.list(thread_id=thread.id, order=ListSortOrder.ASCENDING))

        for message in messages:
            if message.text_messages:
                print(f"{message.role}: {message.text_messages[-1].text.value}")
        
        return { "response": messages[-1].text_messages[-1].text.value }
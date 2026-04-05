import json
import os
import queue
import threading
from functools import lru_cache
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from azure.ai.agents.models import AgentEventHandler, MessageDeltaChunk
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

AGENT_ID = os.environ["AGENT_ID"]
PROJECT_ENDPOINT = os.environ["PROJECT_ENDPOINT"]

@lru_cache(maxsize=1)
def get_project() -> AIProjectClient:
    return AIProjectClient(
        credential=DefaultAzureCredential(),
        endpoint=PROJECT_ENDPOINT,
    )

class MessageRequest(BaseModel):
    message: str
    thread_id: Optional[str] = None

@app.get("/api/health")
def health_check():
    return { "status": "ok" }

@app.post("/api/chat/stream")
def stream_chat(request: MessageRequest):
    project = get_project()
    thread_id = request.thread_id
    if not thread_id:
        thread = project.agents.threads.create()
        thread_id = thread.id

    token_queue: queue.Queue = queue.Queue()

    class StreamingHandler(AgentEventHandler):
        def on_message_delta(self, delta: MessageDeltaChunk):
            text = delta.text
            if text:
                token_queue.put(("token", text))

        def on_done(self):
            token_queue.put(("done", None))

        def on_error(self, data):
            token_queue.put(("error", str(data)))

    def run_agent():
        try:
            project.agents.messages.create(
                thread_id=thread_id,
                role="user",
                content=request.message
            )
            with project.agents.runs.stream(
                thread_id=thread_id,
                agent_id=AGENT_ID,
                event_handler=StreamingHandler()
            ) as handler:
                handler.until_done()
        except Exception as e:
            token_queue.put(("error", str(e)))

    threading.Thread(target=run_agent, daemon=True).start()

    def generate():
        yield f"data: {json.dumps({'thread_id': thread_id})}\n\n"
        while True:
            kind, value = token_queue.get()
            if kind == "done":
                yield "data: [DONE]\n\n"
                break
            elif kind == "error":
                yield f"data: {json.dumps({'error': value})}\n\n"
                break
            else:
                yield f"data: {json.dumps({'token': value})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )
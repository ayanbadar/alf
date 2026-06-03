import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    appointments,
    auth,
    brochure,
    conversations,
    dashboard,
    documents,
    leads,
    settings_api,
    webhook,
)
from app.core.config import get_settings

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(
    title="BusAgent API",
    description="AI WhatsApp Employee for Real Estate",
    version="0.1.0",
    lifespan=lifespan,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_prefix = "/api/v1"
app.include_router(auth.router, prefix=api_prefix)
app.include_router(webhook.router, prefix=api_prefix)
app.include_router(settings_api.router, prefix=api_prefix)
app.include_router(conversations.router, prefix=api_prefix)
app.include_router(brochure.router, prefix=api_prefix)
app.include_router(leads.router, prefix=api_prefix)
app.include_router(appointments.router, prefix=api_prefix)
app.include_router(documents.router, prefix=api_prefix)
app.include_router(dashboard.router, prefix=api_prefix)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+asyncpg://busagent:busagent@localhost:5434/busagent"
    redis_url: str = "redis://localhost:6380"
    secret_key: str = "dev-secret-key-change-in-production"
    encryption_key: str = "dev-encryption-key-change-me-32bytes!!"
    openai_api_key: str = ""
    meta_app_id: str = ""
    meta_app_secret: str = ""
    meta_webhook_verify_token: str = "busagent_webhook_verify"
    meta_graph_api_version: str = "v21.0"
    upload_dir: str = "./uploads"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7
    rag_similarity_threshold: float = 0.72
    chunk_size: int = 512
    chunk_overlap: int = 128
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536
    chat_model: str = "gpt-4o-mini"
    rag_top_k: int = 5

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

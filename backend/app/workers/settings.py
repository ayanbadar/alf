from arq.connections import RedisSettings

from app.core.config import get_settings
from app.workers.tasks import index_document_task, process_inbound_message, shutdown, startup


class WorkerSettings:
    functions = [process_inbound_message, index_document_task]
    on_startup = startup
    on_shutdown = shutdown
    redis_settings = RedisSettings.from_dsn(get_settings().redis_url)
    max_jobs = 10
    job_timeout = 120

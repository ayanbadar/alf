import tiktoken

from app.core.config import get_settings


def chunk_text(text: str) -> list[str]:
    settings = get_settings()
    encoding = tiktoken.get_encoding("cl100k_base")
    tokens = encoding.encode(text)
    if not tokens:
        return []
    chunks: list[str] = []
    start = 0
    size = settings.chunk_size
    overlap = settings.chunk_overlap
    while start < len(tokens):
        end = min(start + size, len(tokens))
        chunk_tokens = tokens[start:end]
        chunks.append(encoding.decode(chunk_tokens))
        if end >= len(tokens):
            break
        start = end - overlap
    return chunks

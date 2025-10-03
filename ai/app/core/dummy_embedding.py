from langchain.embeddings.base import Embeddings
from app.configs.core_config import CoreConfig

# EMBED_DIM = 512


class DummyEmbeddings(Embeddings):

    def __init__(self, core_config: CoreConfig):
        self.core_config = core_config

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [[1.0] * self.core_config.embedding_dim for _ in texts]

    def embed_query(self, text: str) -> list[float]:
        return [1.0] * self.core_config.embedding_dim

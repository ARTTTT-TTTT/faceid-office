from langchain.embeddings.base import Embeddings


class DummyEmbeddings(Embeddings):
    def embed_documents(self, texts):
        return texts

    def embed_query(self, text):
        return text

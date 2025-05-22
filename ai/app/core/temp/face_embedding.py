from langchain.embeddings.base import Embeddings


class DummyEmbeddings(Embeddings):
    """
    คลาส Embeddings สำหรับใช้กับ FAISS โดยไม่มีการ embed ใหม่
    """

    def embed_documents(self, texts):
        return texts

    def embed_query(self, text):
        return text

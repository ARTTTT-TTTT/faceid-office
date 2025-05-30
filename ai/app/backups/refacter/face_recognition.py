import faiss
import numpy as np
from collections import Counter

from langchain_community.vectorstores import FAISS

from app.configs.core_config import CoreConfig
from app.backups.refacter.dummy_embedding import DummyEmbeddings


class FaceRecognition:
    def __init__(self):
        self.config = CoreConfig()
        self.index = None
        self.index_ivf = None
        self.id_to_name = {}
        self.faiss_db = None

    def load_faiss_index(self):
        """Load FAISS index and mappings for face recognition"""
        self.faiss_db = FAISS.load_local(
            self.config.vector_path,
            embeddings=DummyEmbeddings(),
            allow_dangerous_deserialization=True,
        )

        self.index = faiss.read_index(self.config.faiss_path)

        if not isinstance(self.index, faiss.IndexIDMap):
            raise ValueError("Loaded index must be IndexIDMap")

        self.index_ivf = self.index

        docstore_dict = self.faiss_db.docstore._dict
        index_to_docstore_id = self.faiss_db.index_to_docstore_id

        self.id_to_name = {
            faiss_idx: docstore_dict[doc_id].metadata.get("name", "Unknown")
            for faiss_idx, doc_id in index_to_docstore_id.items()
            if doc_id in docstore_dict
        }

        print("[✅] FAISS index and mappings loaded successfully.")

    def find_best_match(self, embedding):
        """Find the best matching person for given embedding"""
        if self.index is None:
            raise ValueError("FAISS index not loaded.")

        embedding = embedding / np.linalg.norm(embedding)
        distances, indices = self.index_ivf.search(
            np.array([embedding]), k=self.config.recognition_k_neighbors
        )
        matched_names = [self.id_to_name.get(int(i), "Unknown") for i in indices[0]]
        name_counter = Counter(matched_names)

        if not name_counter:
            return "Unknown"

        most_common_name = name_counter.most_common(1)[0][0]
        if distances[0][0] < self.config.facenet_threshold:
            return most_common_name
        else:
            return "Unknown"

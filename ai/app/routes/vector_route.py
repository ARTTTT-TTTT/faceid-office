from fastapi import APIRouter
from app.services.vector_service import VectorService

router = APIRouter(prefix="/vectors", tags=["VECTORS"])

vector_service = VectorService()


@router.get("/people")
def get_people_vectors():
    return vector_service.get_people_vectors()


@router.get("/person/{person_id}")
def get_person_vectors(person_id: str):
    return vector_service.get_person_vectors(person_id)


@router.get("/total")
def get_total_vectors():
    return vector_service.get_total_vectors()


@router.post("/build")
def build_vectors():
    return vector_service.build_vectors()


@router.put("/person/{person_id}")
def update_person_vectors(person_id: str):
    return vector_service.update_person_vectors(person_id)


@router.delete("/person/{person_id}")
def delete_person_vectors(person_id: str):
    return vector_service.delete_person_vectors(person_id)

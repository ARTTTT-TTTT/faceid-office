from fastapi import APIRouter, Depends
from app.services.vector_service import VectorService

router = APIRouter(prefix="/vectors", tags=["VECTORS"])


def get_vector_service(admin_id: str) -> VectorService:
    return VectorService(admin_id)


@router.get("/{admin_id}/people")
def get_people_vectors(vector_service: VectorService = Depends(get_vector_service)):
    return vector_service.get_people_vectors()


@router.get("/{admin_id}/person/{person_id}")
def get_person_vectors(person_id: str, vector_service: VectorService = Depends(get_vector_service)):
    return vector_service.get_person_vectors(person_id)


@router.get("/{admin_id}/total")
def get_total_vectors(vector_service: VectorService = Depends(get_vector_service)):
    return vector_service.get_total_vectors()


@router.post("/{admin_id}/build/empty")
def build_empty_vectors(vector_service: VectorService = Depends(get_vector_service)):
    return vector_service.build_empty_vectors()


@router.post("/{admin_id}/build")
def build_vectors(vector_service: VectorService = Depends(get_vector_service)):
    return vector_service.build_vectors()


@router.put("/{admin_id}/person/{person_id}")
def update_person_vectors(
    person_id: str, vector_service: VectorService = Depends(get_vector_service)
):
    return vector_service.update_person_vectors(person_id)


@router.delete("/{admin_id}/person/{person_id}")
def delete_person_vectors(
    person_id: str, vector_service: VectorService = Depends(get_vector_service)
):
    return vector_service.delete_person_vectors(person_id)

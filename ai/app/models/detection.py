from pydantic import BaseModel

class CompressPayload(BaseModel):
    input_image_dir: str
    output_npy_dir: str

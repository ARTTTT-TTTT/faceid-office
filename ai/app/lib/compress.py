import os
from facenet_pytorch import InceptionResnetV1
from PIL import Image
import torch
from torchvision import transforms
import numpy as np

# โหลดโมเดล
model = InceptionResnetV1(pretrained='vggface2').eval()

# Preprocessing function
transform = transforms.Compose([
    transforms.Resize((160, 160)),
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5])
])
# input_img_dir = r"D:\Project\FastAPI\FaceDetectedAPI\data\person_img"
# output_npy_dir = r'D:\Project\FastAPI\FaceDetectedAPI\data\person_npy'
def compress_all_person(input_image_dir, output_npy_dir):
    """ อ่านรูปทั้งหมดใน input_image_dir รวม subfolders → บันทึก npy ใน output_npy_dir โดยแยกตาม folder """
    for root, dirs, files in os.walk(input_image_dir):
        for filename in files:
            if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                img_path = os.path.join(root, filename)

                # path ย่อย เช่น person1/
                relative_path = os.path.relpath(root, input_image_dir)
                output_folder = os.path.join(output_npy_dir, relative_path)
                os.makedirs(output_folder, exist_ok=True)

                # ชื่อไฟล์ output
                npy_filename = os.path.splitext(filename)[0] + '.npy'
                npy_path = os.path.join(output_folder, npy_filename)

                try:
                    # โหลดและ preprocess
                    img = Image.open(img_path).convert('RGB')
                    img_tensor = transform(img).unsqueeze(0)

                    # embedding
                    with torch.no_grad():
                        embedding = model(img_tensor)
                    embedding_np = embedding.squeeze().numpy()

                    # save npy
                    np.save(npy_path, embedding_np)
                    print(f"[✓] Saved: {npy_path}")
                except Exception as e:
                    print(f"[✗] Failed: {img_path} ({e})")


def compress_single_image(input_image_path, output_npy_dir):
    """ อ่านรูป 1 ภาพ → บันทึก npy ใน folder ชื่อคนใน output_npy_dir """
    try:
        # ชื่อ folder (สมมุติ parent folder คือชื่อคน เช่น .../person1/image.jpg → person1)
        person_name = os.path.basename(os.path.dirname(input_image_path))

        output_folder = os.path.join(output_npy_dir, person_name)
        os.makedirs(output_folder, exist_ok=True)

        npy_filename = os.path.splitext(os.path.basename(input_image_path))[0] + '.npy'
        npy_path = os.path.join(output_folder, npy_filename)

        # โหลดและ preprocess
        img = Image.open(input_image_path).convert('RGB')
        img_tensor = transform(img).unsqueeze(0)

        # embedding
        with torch.no_grad():
            embedding = model(img_tensor)
        embedding_np = embedding.squeeze().numpy()

        # save npy
        np.save(npy_path, embedding_np)
        print(f"[✓] Saved single: {npy_path}")
    except Exception as e:
        print(f"[✗] Failed: {input_image_path} ({e})")


# ===== Example call =====
# compress_all_person(input_img_dir, output_npy_dir)
# compress_single_image(r"D:\Project\FastAPI\FaceDetectedAPI\data\person_img\person1\test.jpg", output_npy_dir)

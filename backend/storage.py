"""
Storage utility supporting Neon S3-compatible object storage with local fallback.
"""
import os
from dotenv import load_dotenv
import boto3
from botocore.config import Config

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

AWS_ENDPOINT_URL_S3 = os.getenv("AWS_ENDPOINT_URL_S3")

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-2")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "uploads")

s3_client = None

if AWS_ENDPOINT_URL_S3 and AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
    try:
        s3_client = boto3.client(
            "s3",
            endpoint_url=AWS_ENDPOINT_URL_S3,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION,
            config=Config(s3={"addressing_style": "path"})
        )
    except Exception as e:
        print(f"[Storage] Warning: Failed initializing S3 client: {e}")
        s3_client = None

def upload_file_to_storage(file_obj, filename: str, content_type: str = "application/octet-stream") -> str:
    """
    Uploads a file to Neon S3 storage if configured; otherwise saves locally to backend/uploads.
    Returns the accessible URL for the uploaded file.
    """
    if s3_client and S3_BUCKET_NAME:
        try:
            # Upload to Neon Object Storage
            s3_client.upload_fileobj(
                file_obj,
                S3_BUCKET_NAME,
                filename,
                ExtraArgs={"ContentType": content_type}
            )
            # Neon S3 path-style public URL
            endpoint = AWS_ENDPOINT_URL_S3.rstrip("/")
            return f"{endpoint}/{S3_BUCKET_NAME}/{filename}"
        except Exception as err:
            print(f"[Storage] S3 upload error: {err}. Falling back to local filesystem...")

    # Fallback: Save to local uploads folder
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    local_path = os.path.join(upload_dir, filename)
    file_obj.seek(0)
    with open(local_path, "wb") as f:
        f.write(file_obj.read())
    return f"/uploads/{filename}"

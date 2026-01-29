import hashlib
import bcrypt

def sha256_hash(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()

def bcrypt_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode()

def bcrypt_verify(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

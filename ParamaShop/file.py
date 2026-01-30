import os

BASE_DIR = "parama-shopping"

FOLDERS = [
    "backend",
    "backend/database",
    "backend/auth",
    "backend/users",
    "backend/products",
    "backend/orders",
    "backend/security",
    "backend/logs",
    "backend/utils",
    "backend/middleware",
    "frontend",
    "frontend/public",
    "frontend/src",
    "frontend/src/pages",
    "frontend/src/css",
    "frontend/src/js",
    "frontend/src/assets",
    "docs"
]

FILES = [
    "backend/app.py",
    "backend/config.py",
    "backend/requirements.txt",

    "backend/database/db.py",
    "backend/database/models.py",
    "backend/database/schema.sql",

    "backend/auth/auth_routes.py",
    "backend/auth/otp_service.py",
    "backend/auth/password_utils.py",
    "backend/auth/session_manager.py",

    "backend/users/user_routes.py",
    "backend/users/role_middleware.py",

    "backend/products/product_routes.py",
    "backend/products/product_service.py",

    "backend/orders/order_routes.py",
    "backend/orders/order_service.py",

    "backend/security/encryption.py",
    "backend/security/hashing.py",
    "backend/security/digital_signature.py",
    "backend/security/encoding.py",

    "backend/logs/activity_logger.py",

    "backend/utils/validators.py",
    "backend/utils/response_handler.py",

    "backend/middleware/auth_middleware.py",
    "backend/middleware/role_middleware.py",

    "frontend/src/pages/login.html",
    "frontend/src/pages/register.html",
    "frontend/src/pages/dashboard.html",
    "frontend/src/pages/admin.html",
    "frontend/src/pages/seller.html",
    "frontend/src/pages/products.html",
    "frontend/src/pages/cart.html",
    "frontend/src/pages/orders.html",

    "docs/architecture_diagram.png",
    "docs/database_design.pdf",
    "docs/api_documentation.md",
    "docs/viva_questions.md",

    ".env",
    ".gitignore",
    "README.md"
]


def create_structure():
    print("Creating project structure...\n")

    for folder in FOLDERS:
        path = os.path.join(BASE_DIR, folder)
        os.makedirs(path, exist_ok=True)
        print(f"Created folder: {path}")

    for file in FILES:
        path = os.path.join(BASE_DIR, file)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            f.write("")
        print(f"Created file: {path}")

    print("\n✅ Project structure created successfully!")


if __name__ == "__main__":
    create_structure()

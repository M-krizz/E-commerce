from app import create_app
from database.db import db
from database.models import Role, User, Product, SellerProfile
from auth.password_utils import hash_password

app = create_app()

with app.app_context():
    # check if roles exist
    if Role.query.count() == 0:
        print("Seeding roles...")
        roles = [
            Role(role_id=1, role_name="USER"),
            Role(role_id=2, role_name="ADMIN"),
            Role(role_id=3, role_name="SELLER")
        ]
        db.session.add_all(roles)
        db.session.commit()
        print("Roles seeded successfully.")
    else:
        print("Roles already exist.")

    # Seed demo users
    if User.query.count() == 0:
        print("Seeding demo users...")
        seller = User(
            name="Demo Seller",
            email="seller@paramashop.com",
            password_hash=hash_password("Seller123!"),
            role_id=3,
        )
        user = User(
            name="Demo User",
            email="user@paramashop.com",
            password_hash=hash_password("User123!"),
            role_id=1,
        )
        db.session.add_all([seller, user])
        db.session.commit()

        profile = SellerProfile(
            user_id=seller.user_id,
            shop_name="Parama Tech Store",
            phone="9999999999",
            address="123 Market Road, City Center",
            category="Electronics",
        )
        db.session.add(profile)
        db.session.commit()
        print("Demo users seeded.")

    # Seed demo products
    if Product.query.count() == 0:
        print("Seeding demo products...")
        seller = User.query.filter_by(email="seller@paramashop.com").first() or User.query.first()
        seller_id = seller.user_id if seller else 1
        products = [
            Product(
                seller_id=seller_id,
                product_name="Wireless Noise-Canceling Headphones",
                description="Premium sound, deep bass, and 40-hour battery life.",
                category="Electronics",
                price=1999.00,
                stock=35,
            ),
            Product(
                seller_id=seller_id,
                product_name="Smart Fitness Band",
                description="Track heart rate, sleep, and steps with 7-day battery.",
                category="Wearables",
                price=899.00,
                stock=80,
            ),
            Product(
                seller_id=seller_id,
                product_name="Ergonomic Office Chair",
                description="Breathable mesh, lumbar support, and adjustable height.",
                category="Home & Office",
                price=4999.00,
                stock=15,
            ),
            Product(
                seller_id=seller_id,
                product_name="Portable Blender",
                description="Make smoothies anywhere with USB-C fast charging.",
                category="Kitchen",
                price=699.00,
                stock=50,
            ),
            Product(
                seller_id=seller_id,
                product_name="Minimal Leather Wallet",
                description="Slim profile with RFID protection and 6 card slots.",
                category="Accessories",
                price=499.00,
                stock=120,
            ),
            Product(
                seller_id=seller_id,
                product_name="Gaming Mechanical Keyboard",
                description="Blue switches, RGB lighting, and full anti-ghosting.",
                category="Electronics",
                price=2999.00,
                stock=25,
            ),
        ]
        db.session.add_all(products)
        db.session.commit()
        print("Demo products seeded.")

"""add seller profile and product category

Revision ID: 3c8b2c1f4a9a
Revises: aa03c6ad9a08
Create Date: 2026-01-28 22:05:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "3c8b2c1f4a9a"
down_revision = "aa03c6ad9a08"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("products", sa.Column("category", sa.String(length=80), nullable=True))
    op.create_table(
        "seller_profiles",
        sa.Column("seller_profile_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("shop_name", sa.String(length=150), nullable=True),
        sa.Column("phone", sa.String(length=30), nullable=True),
        sa.Column("address", sa.String(length=255), nullable=True),
        sa.Column("category", sa.String(length=80), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"]),
        sa.PrimaryKeyConstraint("seller_profile_id"),
        sa.UniqueConstraint("user_id"),
    )


def downgrade():
    op.drop_table("seller_profiles")
    op.drop_column("products", "category")

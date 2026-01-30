"""add cascade delete on seller_profiles.user_id

Revision ID: 6b1c2f7a9d21
Revises: 5c2c1a9e7d45
Create Date: 2026-01-29 06:02:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "6b1c2f7a9d21"
down_revision = "5c2c1a9e7d45"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint("seller_profiles_user_id_fkey", "seller_profiles", type_="foreignkey")
    op.create_foreign_key(
        "seller_profiles_user_id_fkey",
        "seller_profiles",
        "users",
        ["user_id"],
        ["user_id"],
        ondelete="CASCADE",
    )


def downgrade():
    op.drop_constraint("seller_profiles_user_id_fkey", "seller_profiles", type_="foreignkey")
    op.create_foreign_key(
        "seller_profiles_user_id_fkey",
        "seller_profiles",
        "users",
        ["user_id"],
        ["user_id"],
    )

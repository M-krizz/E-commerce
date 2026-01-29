"""add seller profile status

Revision ID: 2d3a6b7c4f11
Revises: 8f1b6a3d2c10
Create Date: 2026-01-29 01:05:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "2d3a6b7c4f11"
down_revision = "8f1b6a3d2c10"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("seller_profiles", sa.Column("status", sa.String(length=20), nullable=True))
    op.add_column("seller_profiles", sa.Column("approved_at", sa.DateTime(), nullable=True))
    op.execute("UPDATE seller_profiles SET status = 'PENDING' WHERE status IS NULL")


def downgrade():
    op.drop_column("seller_profiles", "approved_at")
    op.drop_column("seller_profiles", "status")

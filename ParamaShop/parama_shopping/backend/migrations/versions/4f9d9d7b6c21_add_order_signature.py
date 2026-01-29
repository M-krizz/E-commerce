"""add order signature

Revision ID: 4f9d9d7b6c21
Revises: 2d3a6b7c4f11
Create Date: 2026-01-29 01:25:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "4f9d9d7b6c21"
down_revision = "2d3a6b7c4f11"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("orders", sa.Column("order_signature", sa.Text(), nullable=True))


def downgrade():
    op.drop_column("orders", "order_signature")

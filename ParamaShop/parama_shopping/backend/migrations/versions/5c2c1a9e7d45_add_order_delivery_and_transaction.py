"""add order delivery details and transaction id

Revision ID: 5c2c1a9e7d45
Revises: 4f9d9d7b6c21
Create Date: 2026-01-29 02:05:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "5c2c1a9e7d45"
down_revision = "4f9d9d7b6c21"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("orders", sa.Column("transaction_id", sa.Text(), nullable=True))
    op.add_column("orders", sa.Column("delivery_name", sa.String(length=120), nullable=True))
    op.add_column("orders", sa.Column("delivery_phone", sa.String(length=30), nullable=True))
    op.add_column("orders", sa.Column("delivery_address_line1", sa.String(length=255), nullable=True))
    op.add_column("orders", sa.Column("delivery_address_line2", sa.String(length=255), nullable=True))
    op.add_column("orders", sa.Column("delivery_city", sa.String(length=80), nullable=True))
    op.add_column("orders", sa.Column("delivery_state", sa.String(length=80), nullable=True))
    op.add_column("orders", sa.Column("delivery_postal_code", sa.String(length=20), nullable=True))
    op.add_column("orders", sa.Column("delivery_country", sa.String(length=80), nullable=True))


def downgrade():
    op.drop_column("orders", "delivery_country")
    op.drop_column("orders", "delivery_postal_code")
    op.drop_column("orders", "delivery_state")
    op.drop_column("orders", "delivery_city")
    op.drop_column("orders", "delivery_address_line2")
    op.drop_column("orders", "delivery_address_line1")
    op.drop_column("orders", "delivery_phone")
    op.drop_column("orders", "delivery_name")
    op.drop_column("orders", "transaction_id")

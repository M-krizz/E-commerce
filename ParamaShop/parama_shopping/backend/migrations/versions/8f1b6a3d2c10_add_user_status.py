"""add user status

Revision ID: 8f1b6a3d2c10
Revises: 3c8b2c1f4a9a
Create Date: 2026-01-29 00:35:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "8f1b6a3d2c10"
down_revision = "3c8b2c1f4a9a"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("status", sa.String(length=20), nullable=True))
    op.execute("UPDATE users SET status = 'ACTIVE' WHERE status IS NULL")


def downgrade():
    op.drop_column("users", "status")

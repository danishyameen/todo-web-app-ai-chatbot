"""Add recurring tasks table

Revision ID: 005
Revises: 004
Create Date: 2026-01-25 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from typing import Sequence, Union


# revision identifiers
revision: str = '005'
down_revision: Union[str, None] = '004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create recurring_tasks table
    op.create_table('recurring_tasks',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('priority', sa.String(), nullable=False),
        sa.Column('interval_days', sa.Integer(), nullable=False),
        sa.Column('next_occurrence', sa.DateTime(), nullable=False),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('max_occurrences', sa.Integer(), nullable=True),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for better query performance
    op.create_index('idx_recurring_tasks_user_id', 'recurring_tasks', ['user_id'])
    op.create_index('idx_recurring_tasks_next_occurrence', 'recurring_tasks', ['next_occurrence'])
    op.create_index('idx_recurring_tasks_user_next_occurrence', 'recurring_tasks', ['user_id', 'next_occurrence'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_recurring_tasks_user_next_occurrence', table_name='recurring_tasks')
    op.drop_index('idx_recurring_tasks_next_occurrence', table_name='recurring_tasks')
    op.drop_index('idx_recurring_tasks_user_id', table_name='recurring_tasks')

    # Drop recurring_tasks table
    op.drop_table('recurring_tasks')
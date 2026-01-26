"""Add additional indexes for performance optimization

Revision ID: 004
Revises: 003
Create Date: 2026-01-25 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from typing import Sequence, Union


# revision identifiers
revision: str = '004'
down_revision: Union[str, None] = '003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create additional indexes for better query performance
    
    # Indexes for tasks table
    op.create_index('idx_tasks_status_priority', 'tasks', ['status', 'priority'])
    op.create_index('idx_tasks_user_status', 'tasks', ['user_id', 'status'])
    op.create_index('idx_tasks_user_priority', 'tasks', ['user_id', 'priority'])
    op.create_index('idx_tasks_user_category', 'tasks', ['user_id', 'category_id'])
    
    # Indexes for categories table
    op.create_index('idx_categories_user_name', 'categories', ['user_id', 'name'])
    
    # Indexes for conversations table (already added in previous migration)
    # But adding a composite index for user and creation time
    op.create_index('idx_conversations_user_created', 'conversations', ['user_id', 'created_at'])
    
    # Indexes for messages table
    op.create_index('idx_messages_conversation_role', 'messages', ['conversation_id', 'role'])
    op.create_index('idx_messages_conversation_timestamp', 'messages', ['conversation_id', 'timestamp'])


def downgrade() -> None:
    # Drop additional indexes
    op.drop_index('idx_messages_conversation_timestamp', table_name='messages')
    op.drop_index('idx_messages_conversation_role', table_name='messages')
    op.drop_index('idx_conversations_user_created', table_name='conversations')
    op.drop_index('idx_categories_user_name', table_name='categories')
    op.drop_index('idx_tasks_user_category', table_name='tasks')
    op.drop_index('idx_tasks_user_priority', table_name='tasks')
    op.drop_index('idx_tasks_user_status', table_name='tasks')
    op.drop_index('idx_tasks_status_priority', table_name='tasks')
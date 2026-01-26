import asyncio
import time
from datetime import datetime
from sqlmodel import Session
from ..db.session import engine
from ..services.recurring_task_service import RecurringTaskService


class TaskScheduler:
    def __init__(self):
        self.running = False

    def start(self):
        """Start the recurring task scheduler."""
        if self.running:
            print("Scheduler is already running")
            return

        self.running = True
        print("Starting recurring task scheduler...")
        
        # Run the scheduler in a background loop
        asyncio.run(self._run_scheduler())

    async def _run_scheduler(self):
        """Main scheduler loop."""
        while self.running:
            try:
                # Process scheduled recurring tasks
                self._process_recurring_tasks()
                
                # Wait for 1 hour before next check
                # In a real application, you might want to make this configurable
                await asyncio.sleep(3600)  # 1 hour
            except KeyboardInterrupt:
                print("Scheduler interrupted")
                break
            except Exception as e:
                print(f"Error in scheduler: {str(e)}")
                # Wait a bit before retrying
                await asyncio.sleep(60)  # 1 minute

    def _process_recurring_tasks(self):
        """Process all scheduled recurring tasks."""
        try:
            with Session(engine) as session:
                recurring_task_service = RecurringTaskService(session)
                created_tasks = recurring_task_service.process_scheduled_recurring_tasks()
                
                if created_tasks:
                    print(f"Created {len(created_tasks)} new tasks from recurring schedules")
                    for task in created_tasks:
                        print(f"  - Created task: {task.title}")
                else:
                    print("No recurring tasks were due")
        except Exception as e:
            print(f"Error processing recurring tasks: {str(e)}")

    def stop(self):
        """Stop the scheduler."""
        self.running = False
        print("Scheduler stopped")


# Global scheduler instance
scheduler = TaskScheduler()


def start_scheduler():
    """Start the task scheduler."""
    scheduler.start()


def stop_scheduler():
    """Stop the task scheduler."""
    scheduler.stop()
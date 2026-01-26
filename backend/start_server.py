import uvicorn
from src.main import app
from src.utils.task_scheduler import start_scheduler
from dotenv import load_dotenv
import os
import threading

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Start the recurring task scheduler in a separate thread
    scheduler_thread = threading.Thread(target=start_scheduler, daemon=True)
    scheduler_thread.start()

    # Start the FastAPI server
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("DEBUG", "False").lower() == "true"
    )
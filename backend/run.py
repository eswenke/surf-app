import uvicorn

if __name__ == "__main__":
    """
    Run the FastAPI application using Uvicorn.
    
    This script provides a convenient way to start the API server
    with the correct configuration.
    """
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",  # Use localhost for browser access
        port=8000,
        reload=True  # Enable auto-reload during development
    )

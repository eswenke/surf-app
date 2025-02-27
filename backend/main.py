from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker

# Database URL (MAYBE DONT INCLUDE THE PASSWORD IN THE CODEBASE)
DATABASE_URL = "postgresql+asyncpg://surfuser:yourpassword@localhost/surfforecast"

app = FastAPI()

# Set CORS policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your React frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI"}

# # Create engine and session
# engine = create_engine(DATABASE_URL, echo=True)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# # Create engine and session
# engine = create_engine(DATABASE_URL, echo=True)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# @app.get("/forecast/{spot_id}")
# async def get_forecast(spot_id: int):
#     # Connect to database and fetch forecast
#     session = SessionLocal()
#     result = session.execute(f"SELECT * FROM forecasts WHERE spot_id = {spot_id}")
#     return {"forecast": result.fetchall()}



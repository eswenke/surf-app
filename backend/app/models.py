from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ReviewBase(BaseModel):
    """Base model for review data"""
    spot_id: int
    user_id: str  # This will store the username
    rating: int = Field(..., ge=1, le=5)  # Rating from 1-5
    comment: str
    wave_height: Optional[float] = None
    wind_condition: Optional[str] = None
    weather_condition: Optional[str] = None
    crowd_level: Optional[int] = Field(None, ge=1, le=5)  # Crowd level from 1-5


class ReviewCreate(ReviewBase):
    """Model for creating a new review"""
    pass


class ReviewUpdate(BaseModel):
    """Model for updating an existing review"""
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None
    wave_height: Optional[float] = None
    wind_condition: Optional[str] = None
    weather_condition: Optional[str] = None
    crowd_level: Optional[int] = Field(None, ge=1, le=5)


class Review(ReviewBase):
    """Complete review model with database fields"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Spot and Forecast models
class SpotBase(BaseModel):
    """Base model for spot data"""
    name: str
    latitude: float
    longitude: float
    description: Optional[str] = None
    location: Optional[str] = None
    difficulty: Optional[str] = None


class SpotCreate(SpotBase):
    """Model for creating a new spot"""
    pass


class SpotUpdate(BaseModel):
    """Model for updating an existing spot"""
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None
    location: Optional[str] = None
    difficulty: Optional[str] = None


class Spot(SpotBase):
    """Complete spot model with database fields"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ForecastBase(BaseModel):
    """Base model for forecast data"""
    spot_id: int
    forecast_data: Dict[str, Any]
    timestamp: datetime


class ForecastCreate(ForecastBase):
    """Model for creating a new forecast"""
    pass


class Forecast(ForecastBase):
    """Complete forecast model with database fields"""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ForecastDay(BaseModel):
    """Model for a single day's forecast"""
    day: str
    date: str
    waveHeight: str
    wind: str
    weather: Optional[str] = None
    temperature: Optional[float] = None


class SpotForecast(BaseModel):
    """Model for spot forecast data"""
    spot_id: int
    spot_name: str
    forecast: List[ForecastDay]
    last_updated: datetime

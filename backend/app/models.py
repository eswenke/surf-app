from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ReviewBase(BaseModel):
    """Base model for review data"""
    spot_id: int
    user_id: str
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

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime, timezone
from ..models import ReviewCreate, Review, ReviewUpdate
from ..database import get_supabase_client

router = APIRouter()


@router.post("/reviews", response_model=Review)
async def create_review(review: ReviewCreate):
    """
    Create a new review for a surf spot.
    """
    supabase = get_supabase_client()
    
    # Prepare data for insertion
    review_data = review.model_dump()
    review_data["created_at"] = datetime.now(timezone.utc).isoformat()
    
    try:
        # Insert review into Supabase
        response = supabase.table("reviews").insert(review_data).execute()
        
        # Check if the insertion was successful
        if len(response.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to create review")
        
        # Return the created review
        return {**response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating review: {str(e)}")


@router.get("/reviews", response_model=List[Review])
async def get_reviews(spot_id: Optional[int] = None, user_id: Optional[str] = None):
    """
    Get reviews with optional filtering by spot_id or user_id.
    """
    supabase = get_supabase_client()
    
    try:
        # Build the query with filters
        query_params = {}
        if spot_id is not None:
            query_params["spot_id"] = spot_id
        if user_id is not None:
            query_params["user_id"] = user_id
        
        # Execute the query with filters
        if query_params:
            response = supabase.table("reviews").select("*").match(query_params).order("created_at", desc=True).execute()
        else:
            response = supabase.table("reviews").select("*").order("created_at", desc=True).execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching reviews: {str(e)}")


@router.get("/reviews/{review_id}", response_model=Review)
async def get_review(review_id: int):
    """
    Get a specific review by ID.
    """
    supabase = get_supabase_client()
    
    try:
        response = supabase.table("reviews").select("*").eq("id", review_id).execute()
        
        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Review not found")
        
        return response.data[0]
    except Exception as e:
        if "404" in str(e):
            raise HTTPException(status_code=404, detail="Review not found")
        raise HTTPException(status_code=500, detail=f"Error fetching review: {str(e)}")


@router.patch("/reviews/{review_id}", response_model=Review)
async def update_review(review_id: int, review_update: ReviewUpdate):
    """
    Update an existing review.
    """
    supabase = get_supabase_client()
    
    # Prepare update data
    update_data = review_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    try:
        # Check if review exists
        check_response = supabase.table("reviews").select("*").eq("id", review_id).execute()
        if len(check_response.data) == 0:
            raise HTTPException(status_code=404, detail="Review not found")
        
        # Update the review
        response = supabase.table("reviews").update(update_data).eq("id", review_id).execute()
        
        return response.data[0]
    except Exception as e:
        if "404" in str(e):
            raise HTTPException(status_code=404, detail="Review not found")
        raise HTTPException(status_code=500, detail=f"Error updating review: {str(e)}")


@router.delete("/reviews/{review_id}", response_model=dict)
async def delete_review(review_id: int):
    """
    Delete a review.
    """
    supabase = get_supabase_client()
    
    try:
        # Check if review exists
        check_response = supabase.table("reviews").select("*").eq("id", review_id).execute()
        if len(check_response.data) == 0:
            raise HTTPException(status_code=404, detail="Review not found")
        
        # Delete the review
        supabase.table("reviews").delete().eq("id", review_id).execute()
        
        return {"message": "Review deleted successfully"}
    except Exception as e:
        if "404" in str(e):
            raise HTTPException(status_code=404, detail="Review not found")
        raise HTTPException(status_code=500, detail=f"Error deleting review: {str(e)}")

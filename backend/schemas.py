from pydantic import BaseModel, EmailStr
from typing import Optional


# Payload used by the signup endpoint.
class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    terms_accepted: bool


# Public user data returned to clients (no password fields).
class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr

    class Config:
        # Allow converting SQLAlchemy model instances directly to this schema.
        from_attributes = True


# Payload used by the login endpoint.
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Request body for generating password reset tokens.
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


# Request body for completing password reset with token validation.
class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class FeedbackReviewResponse(BaseModel):
    id: int
    story: str
    predicted_intent: Optional[str] = None
    correct_intent: Optional[str] = None
    suggested_category: Optional[str] = None
    rating: Optional[int] = None
    status: str

    class Config:
        from_attributes = True
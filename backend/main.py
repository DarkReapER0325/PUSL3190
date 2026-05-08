from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordBearer
import re
import os
import json

import models
import schemas
from database import engine, SessionLocal
from sentence_transformers import SentenceTransformer

import secrets
from datetime import timedelta

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from models import Category, Scenario


# Create tables at startup so the app can run against a fresh local database.
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow the Vite frontend during local development to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# bcrypt only uses the first 72 bytes, so truncate before hashing to avoid
# hashing behavior that differs from what the user typed.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your-super-secret-key-change-this"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Load the semantic model once at startup so requests can reuse the cached
# embeddings instead of paying the initialization cost every time.
semantic_model = SentenceTransformer("all-MiniLM-L6-v2")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Hash a raw password before storing it in the database.
def hash_password(password: str):
    # Keep the input within bcrypt's supported byte length.
    password = password[:72]
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt

#Provide a database session for each request and close it safely
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    # Reuse a single 401 response so callers see the same failure shape for
    # invalid, expired, or unknown tokens.
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str | None = payload.get("sub")

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == email).first()

    if user is None:
        raise credentials_exception

    return user

@app.get("/")
# Lightweight health-check endpoint for local verification and deployments.
def root():
    return {"message": "Backend running 🚀"}

# 🔥 SIGNUP API
@app.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):

    # Keep registration consistent with the frontend by requiring the user to
    # accept the terms before account creation.
    if not user.terms_accepted:
        raise HTTPException(
            status_code=400,
            detail="You must accept the Terms of Service and Privacy Policy"
        )

    # Enforce unique email addresses before inserting a new user.
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

# 🔥 LOGIN API
@app.post("/login")
# Authenticate a user with email and password credentials.
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):

    db_user: models.User = db.query(models.User).filter(models.User.email == user.email).first()

    # Reject unknown users before checking passwords.
    if not db_user:
        raise HTTPException(status_code=400, detail="User not found")

    # Verify the submitted password against the stored hash.
    if not pwd_context.verify(user.password, str(db_user.password)):
        raise HTTPException(status_code=400, detail="Invalid password")


    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # Embed the user email in the JWT subject so protected routes can recover
    # the current account from the token later.
    access_token = create_access_token(
        data={"sub": db_user.email},
        expires_delta=access_token_expires
    )

    return {
    "message": "Login successful",
    "access_token": access_token,
    "token_type": "bearer",
    "user": {
        "id": db_user.id,
        "first_name": db_user.first_name,
        "last_name": db_user.last_name,
        "email": db_user.email
    }
}


def detect_intent(user_story: str, db):
    categories = db.query(Category).all()

    # 🛑 Prevent crash if DB is empty
    if not categories:
        return "unknown", 0.0

    texts = [c.description for c in categories]
    labels = [c.label for c in categories]

    category_embeddings = semantic_model.encode(texts)
    story_embedding = semantic_model.encode([user_story])

    if len(texts) == 0:
        return "unknown", 0.0

    similarities = cosine_similarity(story_embedding, category_embeddings)[0]

    best_idx = similarities.argmax()
    best_score = similarities[best_idx]

    return labels[best_idx], float(best_score)

# Extract actor, action, object, goal, and condition from a user story sentence.
def extract_story_parts(user_story: str) -> dict:
    story = user_story.strip()

    result = {
        "actor": "user",
        "action": "perform",
        "object": "the requested feature",
        "goal": "",
        "condition": ""
    }

    pattern = re.compile(
        r"as a[n]?\s+(.*?),\s*i want to\s+(.*?)(?:\s+so that\s+(.*))?$",
        re.IGNORECASE
    )

    match = pattern.search(story)
    if match:
        actor = match.group(1).strip()
        action_part = match.group(2).strip()
        goal = match.group(3).strip() if match.group(3) else ""

        result["actor"] = actor
        result["goal"] = goal

        action_words = action_part.split()
        if len(action_words) >= 2:
            result["action"] = action_words[0]
            result["object"] = " ".join(action_words[1:])
        elif len(action_words) == 1:
            result["action"] = action_words[0]
            result["object"] = "the requested feature"

        return result

    lowered = story.lower()
    if "if " in lowered:
        condition_match = re.search(r"(if .*?)(?:,|\.|$)", lowered)
        if condition_match:
            result["condition"] = condition_match.group(1).strip()

    return result

#Build a single standardized test case object
def create_test_case(tc_id: str, description: str, expected_result: str):
    return {
        "id": tc_id,
        "description": description,
        "expected_result": expected_result
    }

def get_scenario_types(intent: str, db):
    scenarios = db.query(Scenario).filter(Scenario.intent == intent).all()

    if not scenarios:
        return ["positive", "invalid", "missing", "boundary"]

    return [s.scenario_type for s in scenarios]  # 👈 THIS LINE IS CRITICAL

#Generate intent-specific test cases for a given user story
def build_test_cases(intent: str, user_story: str, db):
    parts = extract_story_parts(user_story)
    actor = parts.get("actor", "user")
    action = parts.get("action", "perform")
    obj = parts.get("object", "the requested feature")

    scenarios = get_scenario_types(intent, db)
    test_cases = []
    counter = 1

    for scenario in scenarios:
        tc = generate_test_case_from_scenario(
            scenario=scenario,
            actor=actor,
            action=action,
            obj=obj,
            intent=intent
        )
        if tc:
            tc["id"] = f"TC{counter}"
            test_cases.append(tc)
            counter += 1

    return test_cases

def generate_test_case_from_scenario(scenario: str, actor: str, action: str, obj: str, intent: str):
    # Map each scenario keyword to a stable, human-readable test case shape.
    if scenario == "positive":
        return create_test_case(
            "",
            f"Verify that the {actor} can successfully {action} {obj} with valid input",
            "System completes the requested action successfully"
        )

    elif scenario == "invalid":
        return create_test_case(
            "",
            f"Verify that the system handles invalid input when the {actor} tries to {action} {obj}",
            "System displays an appropriate validation or error message"
        )

    elif scenario == "missing":
        return create_test_case(
            "",
            f"Verify that validation is shown when required input is missing while the {actor} tries to {action} {obj}",
            "System prevents the action and shows required field validation"
        )

    elif scenario == "boundary":
        return create_test_case(
            "",
            f"Verify that the system handles boundary or edge cases when the {actor} tries to {action} {obj}",
            "System behaves correctly under edge conditions"
        )

    elif scenario == "authorization":
        return create_test_case(
            "",
            f"Verify that unauthorized users cannot {action} {obj}",
            "System denies access and shows an appropriate authorization message"
        )

    elif scenario == "invalid_credentials":
        return create_test_case(
            "",
            f"Verify that login is rejected when the {actor} enters invalid credentials",
            "System displays an invalid credentials error message"
        )

    elif scenario == "duplicate_email":
        return create_test_case(
            "",
            f"Verify that registration fails when the {actor} uses an already registered email",
            "System displays an email already exists error"
        )

    elif scenario == "no_results":
        return create_test_case(
            "",
            f"Verify that the system shows no results when the {actor} searches {obj} using a non-matching keyword",
            "System shows a no results found message"
        )

    elif scenario == "invalid_payment":
        return create_test_case(
            "",
            "Verify that payment is rejected when invalid payment details are entered",
            "System displays a payment failure message"
        )

    elif scenario == "cancel":
        return create_test_case(
            "",
            "Verify that the current process can be cancelled by the user before completion",
            "System cancels the process without saving or processing data"
        )

    elif scenario == "unregistered_email":
        return create_test_case(
            "",
            "Verify that password reset requests for unregistered emails are handled correctly",
            "System displays an appropriate error message"
        )

    elif scenario == "invalid_token":
        return create_test_case(
            "",
            "Verify that the process fails with an expired or invalid token",
            "System rejects the request and prompts the user to retry"
        )

    elif scenario == "post_logout_access":
        return create_test_case(
            "",
            "Verify that protected pages cannot be accessed after logout",
            "System redirects the user to the login page"
        )

    elif scenario == "session_invalidation":
        return create_test_case(
            "",
            "Verify that the session token becomes invalid after logout",
            "Old session cannot be reused"
        )

    elif scenario == "invalid_link":
        return create_test_case(
            "",
            "Verify that the system handles invalid verification links correctly",
            "System displays an invalid link message"
        )

    elif scenario == "expired_link":
        return create_test_case(
            "",
            "Verify that expired verification links cannot be used",
            "System asks the user to request a new verification email"
        )

    elif scenario == "add_item":
        return create_test_case(
            "",
            f"Verify that the {actor} can add an item to the cart",
            "Selected item is added to the cart successfully"
        )

    elif scenario == "remove_item":
        return create_test_case(
            "",
            f"Verify that the {actor} can remove an item from the cart",
            "Selected item is removed from the cart successfully"
        )

    elif scenario == "update_quantity":
        return create_test_case(
            "",
            "Verify that updating item quantity changes the cart total correctly",
            "Cart total and quantity are updated correctly"
        )

    elif scenario == "confirmation":
        return create_test_case(
            "",
            "Verify that a confirmation is displayed after successful completion",
            "System shows a confirmation message to the user"
        )

    elif scenario == "unavailable_slot":
        return create_test_case(
            "",
            "Verify that the request fails when the selected slot is unavailable",
            "System displays a slot unavailable message"
        )

    elif scenario == "invalid_file_type":
        return create_test_case(
            "",
            "Verify that the system rejects unsupported file formats",
            "System displays an invalid file type message"
        )

    elif scenario == "file_too_large":
        return create_test_case(
            "",
            "Verify that the system rejects files exceeding the allowed size limit",
            "System displays a file size limit error"
        )

    elif scenario == "triggered":
        return create_test_case(
            "",
            "Verify that a notification is sent when the triggering event occurs",
            "User receives the correct notification"
        )

    elif scenario == "content_check":
        return create_test_case(
            "",
            "Verify that notification content is accurate",
            "Notification contains correct message details"
        )

    elif scenario == "disabled":
        return create_test_case(
            "",
            "Verify that no notification is sent when notification settings are disabled",
            "No notification is delivered"
        )

    elif scenario == "admin_access":
        return create_test_case(
            "",
            "Verify that an admin user can access the admin dashboard",
            "Admin dashboard loads successfully"
        )

    elif scenario == "non_admin_access":
        return create_test_case(
            "",
            "Verify that a non-admin user cannot access admin functionality",
            "Access is denied"
        )

    elif scenario == "manage_users":
        return create_test_case(
            "",
            "Verify that an admin can manage users with valid permissions",
            "Requested admin action is completed successfully"
        )

    elif scenario == "empty_cart":
        return create_test_case(
            "",
            "Verify that checkout is blocked when the cart is empty",
            "System prevents checkout and shows an appropriate message"
        )

    elif scenario == "page_unavailable":
        return create_test_case(
            "",
            "Verify that navigation fails gracefully when the target page is unavailable",
            "System shows an appropriate error message"
        )

    return None

@app.get("/users")
def get_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # This is a simple authenticated endpoint used for user listing/debugging.
    users = db.query(models.User).all()
    return users

@app.post("/generate")
def generate_test_cases(
    data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Normalize the incoming story before intent detection and test generation.
    story = data.get("story", "").strip()

    if not story:
        raise HTTPException(status_code=400, detail="User story is required")

    intent, confidence = detect_intent(story, db)

    if intent == "unknown" or confidence < 0.45:

        # ✅ SAVE USER STORY EVEN IF INVALID
        user_story_record = models.UserStory(
            user_id=current_user.id,
            story=story,
            detected_intent="unknown",
            confidence=confidence
        )
        db.add(user_story_record)
        db.flush()

        db.commit()

        return {
            "intent": "unknown",
            "confidence": round(confidence, 4),
            "test_cases": [],
            "error": "This user story does not match any supported feature category. Please rephrase the story.",
            "available_categories": [
                "authentication",
                "registration",
                "search",
                "payment",
                "cart"
            ]
        }

    test_cases = build_test_cases(intent, story, db)

    # Save user story
    user_story_record = models.UserStory(
    user_id=current_user.id,
    story=story,
    detected_intent=intent,
    confidence=confidence
)

    db.add(user_story_record)
    db.flush()  # Flush to get the generated ID for the user story record
    db.refresh(user_story_record)

    # Save test cases
    for tc in test_cases:
        test_case_record = models.TestCase(
            story_id=user_story_record.id,
            scenario=tc["id"],
            steps=tc["description"],
            expected_result=tc["expected_result"]
        )
        db.add(test_case_record)

    history_record = models.GenerationHistory(
        user_id=current_user.id,
        user_story=story,
        detected_intent=intent,
        confidence_score=round(confidence, 4),
        test_cases_json=json.dumps(test_cases)
    )

    db.add(history_record)
    db.commit()
    db.refresh(history_record)

    # Persist the generated cases so the user can revisit them later.
    return {
        "intent": intent,
        "confidence": round(confidence, 4),
        "test_cases": test_cases,
        "history_id": history_record.id,
        "error": ""
    }

@app.get("/history")
def get_generation_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Return only the current user's history, newest entries first.
    history = (
        db.query(models.GenerationHistory)
        .filter(models.GenerationHistory.user_id == current_user.id)
        .order_by(models.GenerationHistory.created_at.desc())
        .all()
    )

    return [
        {
            "id": item.id,
            "user_story": item.user_story,
            "detected_intent": item.detected_intent,
            "confidence_score": item.confidence_score,
            "test_cases": json.loads(str(item.test_cases_json)),
            "created_at": item.created_at,
            "rating": item.rating,
            "feedback_comment": item.feedback_comment
        }
        for item in history
    ]

@app.post("/feedback/history/{history_id}")
def submit_history_feedback(
    history_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    record = db.query(models.GenerationHistory).filter(
        models.GenerationHistory.id == history_id,
        models.GenerationHistory.user_id == current_user.id
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    rating = int(data.get("rating") or 0)

    if rating is None or rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be 1–5")

    record.rating = rating
    record.feedback_comment = str(data.get("comment") or "")

    db.commit()

    return {"message": "Feedback saved successfully"}


@app.post("/feedback/correction")
def submit_correction_feedback(
    data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not data.get("correct_intent"):
        raise HTTPException(status_code=400, detail="Correct intent required")

    feedback = models.Feedback(
        story=data.get("story"),
        predicted_intent=data.get("predicted_intent"),
        correct_intent=data.get("correct_intent"),
        suggested_category=data.get("suggested_category"),
        rating=data.get("rating")
    )

    db.add(feedback)
    db.commit()

    return {"message": "Correction saved"}

@app.delete("/history/{history_id}")
def delete_generation_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Only allow deleting history records owned by the authenticated user.
    history_item = (
        db.query(models.GenerationHistory)
        .filter(
            models.GenerationHistory.id == history_id,
            models.GenerationHistory.user_id == current_user.id
        )
        .first()
    )

    if not history_item:
        raise HTTPException(status_code=404, detail="History item not found")

    db.delete(history_item)
    db.commit()

    return {"message": "History item deleted successfully"}


@app.post("/forgot-password")
def forgot_password(
    data: schemas.ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    # Keep the response generic so the endpoint does not reveal whether an
    # email address exists in the system.
    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user:
        return {
            "message": "If the email exists, a password reset link has been generated."
        }

    token = secrets.token_urlsafe(32)
    expiry = datetime.now(timezone.utc) + timedelta(minutes=15)

    # Store the reset token and expiry directly on the user record for later
    # validation during the password reset step.
    setattr(user, "reset_token", token)
    setattr(user, "reset_token_expiry", expiry)

    db.commit()

    print(f"RESET LINK: http://localhost:5173/reset-password?token={token}")

    return {
        "message": "Password reset link generated. Check backend console for the reset link."
    }


@app.post("/reset-password")
def reset_password(
    data: schemas.ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    # Look up the user by reset token rather than by email to avoid trusting
    # a stale or tampered identity value from the client.
    user = (
        db.query(models.User)
        .filter(models.User.reset_token == data.token)
        .first()
    )

    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    token_expiry = getattr(user, "reset_token_expiry", None)

    if token_expiry is None:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    if token_expiry.tzinfo is None:
        token_expiry = token_expiry.replace(tzinfo=timezone.utc)

    if token_expiry < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token has expired")

    # Overwrite the old password and clear the reset token so it cannot be
    # reused after a successful reset.
    setattr(user, "password", hash_password(data.new_password))
    setattr(user, "reset_token", None)
    setattr(user, "reset_token_expiry", None)

    db.commit()

    return {"message": "Password reset successful. You can now log in."}


@app.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(models.Category).all()

    return [
        {
            "id": category.id,
            "label": category.label,
            "description": category.description
        }
        for category in categories
    ]

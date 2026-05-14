import json
from database import SessionLocal
from models import Category, Scenario, User
from passlib.context import CryptContext

db = SessionLocal()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Load categories
with open("categories.json") as f:
    data = json.load(f)

for cat in data["categories"]:
    exists = db.query(Category).filter_by(label=cat["label"]).first()
    if not exists:
        db.add(Category(label=cat["label"], description=cat["description"]))


# Load scenarios
with open("scenario_patterns.json") as f:
    data = json.load(f)

for intent, scenarios in data["intent_scenarios"].items():
    for s in scenarios:
        exists = db.query(Scenario).filter_by(intent=intent, scenario_type=s).first()
        if not exists:
            db.add(Scenario(intent=intent, scenario_type=s))


# Load Admin user
admin_email = "admin@testcasegen.com"

existing_admin = db.query(User).filter_by(email=admin_email).first()

if not existing_admin:

    hashed_password = pwd_context.hash("Admin@123")

    admin_user = User(
    first_name="System",
    last_name="Admin",
    email="admin@testcasegen.com",
    hashed_password=pwd_context.hash("Admin@123"),
    is_admin=True
)

    db.add(admin_user)

    print("Admin user created successfully!")

else:
    print("Admin user already exists.")



db.commit()
db.close()

print("Data loaded successfully!")
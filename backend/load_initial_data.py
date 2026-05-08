import json
from database import SessionLocal
from models import Category, Scenario

db = SessionLocal()

# Load categories
with open("categories.json") as f:
    data = json.load(f)

for cat in data["categories"]:
    exists = db.query(Category).filter_by(label=cat["label"]).first()
    if not exists:
        db.add(Category(
            label=cat["label"],
            description=cat["description"]
        ))

# Load scenarios
with open("scenario_patterns.json") as f:
    data = json.load(f)

for intent, scenarios in data["intent_scenarios"].items():
    for s in scenarios:
        exists = db.query(Scenario).filter_by(
            intent=intent,
            scenario_type=s
        ).first()

        if not exists:
            db.add(Scenario(
                intent=intent,
                scenario_type=s
            ))

db.commit()
db.close()

print("Data loaded successfully!")
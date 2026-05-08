# 1. Imports
import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

from main import detect_intent


# 2. Keyword-based classifier
def detect_intent_keyword(user_story: str) -> str:
    story = user_story.lower()

    if any(word in story for word in ["login", "log in", "sign in"]):
        return "login"
    elif any(word in story for word in ["register", "sign up", "signup", "create account"]):
        return "registration"
    elif any(word in story for word in ["search", "find", "look for", "filter"]):
        return "search"
    elif any(word in story for word in ["payment", "pay", "card payment", "make payment"]):
        return "payment"
    elif any(word in story for word in ["profile", "account settings", "edit profile", "update profile"]):
        return "profile"
    elif any(word in story for word in ["forgot password", "reset password", "password reset"]):
        return "password_reset"
    elif any(word in story for word in ["logout", "log out", "sign out"]):
        return "logout"
    elif any(word in story for word in ["verify email", "email verification", "confirm email"]):
        return "email_verification"
    elif any(word in story for word in ["cart", "shopping cart", "add to cart", "remove from cart"]):
        return "cart"
    elif any(word in story for word in ["order", "place order", "track order"]):
        return "order"
    elif any(word in story for word in ["book", "booking", "reserve", "reservation"]):
        return "booking"
    elif any(word in story for word in ["upload", "file upload", "attach file", "import file"]):
        return "file_upload"
    elif any(word in story for word in ["notification", "alert", "push notification", "email alert"]):
        return "notification"
    elif any(word in story for word in ["admin", "administrator", "manage users", "admin dashboard"]):
        return "admin"
    elif any(word in story for word in ["checkout", "complete purchase"]):
        return "checkout"
    elif any(word in story for word in ["navigate", "open page", "go to page"]):
        return "page_navigation"

    return "unknown"


# 3. Evaluation helper
def print_metrics(name, y_true, y_pred):
    print(f"\n{name}")
    print("-" * 40)

    print("Accuracy :", round(float(accuracy_score(y_true, y_pred)), 4))
    print("Precision:", round(float(precision_score(y_true, y_pred, average="weighted", zero_division=0)), 4))
    print("Recall   :", round(float(recall_score(y_true, y_pred, average="weighted", zero_division=0)), 4))
    print("F1-score :", round(float(f1_score(y_true, y_pred, average="weighted", zero_division=0)), 4))


# 4. Load dataset
df = pd.read_csv("evaluation_dataset.csv")

y_true = df["expected_label"].tolist()


# 5. Predictions
y_pred_keyword = [detect_intent_keyword(story) for story in df["story"]]
y_pred_semantic = [detect_intent(story)[0] for story in df["story"]]


# 6. Results
print_metrics("Keyword-based Classifier", y_true, y_pred_keyword)
print_metrics("Semantic Classifier", y_true, y_pred_semantic)

print("\nDetailed Semantic Classification Report")
print(classification_report(y_true, y_pred_semantic, zero_division=0))
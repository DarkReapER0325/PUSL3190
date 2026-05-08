# TestCaseGen – AI-Based Automated Test Case Generator

## 📌 Overview
TestCaseGen is a web-based system that automatically generates functional test cases from Agile user stories using NLP techniques.

The system analyzes user stories, detects the feature/intent, and generates structured test cases including:
- Positive scenarios
- Invalid input cases
- Missing input cases
- Boundary/edge cases

---

## 🚀 Features
- User authentication (JWT-based)
- Protected routes (secure API access)
- AI-based intent detection
- Dynamic test case generation
- Generation history (saved in database)
- Profile page with history management
- Export test cases (CSV)
- Copy test cases
- Delete individual history records
- Forgot & Reset password functionality
- Terms of Service & Privacy Policy pages

---

## 🧠 Technologies Used

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- Passlib (bcrypt)

### AI / NLP
- HuggingFace Transformers
- Sentence Transformers
- PyTorch
- Scikit-learn

### Frontend
- React (Vite)
- Axios
- React Router

---

## ⚙️ Setup Instructions

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Backend runs on

```bash
http://127.0.0.1:8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Frontend runs on

```bash
http://localhost:5173
```
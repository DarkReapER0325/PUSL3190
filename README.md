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

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python** 3.8 or higher
- **Node.js** 16.0 or higher
- **npm** 7.0 or higher
- **Git**

To check your versions:
```bash
python --version
node --version
npm --version
```

---

## 📁 Project Structure

```
Main Project/
├── backend/                    # FastAPI backend
│   ├── main.py                # Main entry point
│   ├── models.py              # Database models
│   ├── schemas.py             # Pydantic schemas
│   ├── database.py            # Database configuration
│   ├── requirements.txt        # Python dependencies
│   ├── categories.json        # Test case categories
│   └── scenario_patterns.json # NLP patterns
├── frontend/                   # React (Vite) frontend
│   ├── src/
│   │   ├── pages/            # React pages (Login, Register, Generator, etc.)
│   │   ├── components/       # Reusable components
│   │   ├── css/              # Stylesheets
│   │   ├── api/              # API calls (axiosInstance)
│   │   └── App.jsx           # Root component
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite configuration
└── README.md                  # This file
```

---

## 🔧 Environment Variables

### Backend (.env file in `backend/` directory)

Create a `.env` file in the backend folder with:

```bash
# Database
DATABASE_URL=sqlite:///./test.db

# JWT Configuration
SECRET_KEY=your-secret-key-here-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (for frontend access)
CORS_ORIGINS=["http://localhost:5173"]
```

> ⚠️ **Important:** Change `SECRET_KEY` to a strong random value in production!

### Frontend (.env file in `frontend/` directory)

Create a `.env` file in the frontend folder with:

```bash
VITE_API_URL=http://127.0.0.1:8000
```

---

## 🗄️ Database Setup

The backend uses SQLite by default. The database initializes automatically on first run:

1. Start the backend server (see setup instructions above)
2. The database file `test.db` will be created in the `backend/` directory
3. Load initial data:
   ```bash
   python backend/load_initial_data.py
   ```
4. (Optional) Default admin credentials created by the script:

   - Email: admin@testcasegen.com
   - Password: Admin@123

   Admin Only Page
   http://localhost:5173/admin/feedback
   
---

## 📚 API Documentation

Once the backend is running, access the interactive API docs at:

- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc

---

## 🐛 Troubleshooting

### Backend issues

**Port 8000 already in use:**
```bash
uvicorn main:app --reload --port 8001
```

**Python module not found:**
```bash
pip install -r requirements.txt --upgrade
```

**Database errors:**
```bash
# Remove old database and restart
rm backend/test.db
# Then restart the backend
```

### Frontend issues

**Port 5173 already in use:**
```bash
npm run dev -- --port 5174
```

**Dependencies not installed:**
```bash
rm -r frontend/node_modules frontend/package-lock.json
npm install
```

**CORS errors:**
Ensure `VITE_API_URL` matches backend URL and backend `CORS_ORIGINS` includes frontend URL.

---

## 📝 License

This project is open source and available under the **MIT License**. See the LICENSE file for more details.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 👤 Author

**Yasindu Balapatabendi**

- GitHub: [@DarkReapER0325](https://github.com/DarkReapER0325)
- Email: yasinducsilva@gmail.com

---

## 📞 Support

For issues, questions, or suggestions, please open an issue on the [GitHub repository](https://github.com/DarkReapER0325/PUSL3190/issues).

---

**Happy testing! 🎉**

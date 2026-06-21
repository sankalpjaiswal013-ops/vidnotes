# VidNotes AI 🎥📝

VidNotes AI is a full-stack web application that automatically converts YouTube videos into structured written articles, interactive 3D flashcards, and multiple-choice quizzes. Built for students, professionals, and lifelong learners, this tool lets you "learn without watching" by extracting key knowledge directly from video transcripts using Google's Gemini AI.

## ✨ Features

- **Instant Video Processing:** Paste any YouTube link (Lectures, Podcasts, Shorts) and instantly extract the transcript.
- **AI-Powered Notes:** Automatically structures the video into a well-formatted article with logical sections and a "Key Takeaways" summary.
- **Interactive Flashcards:** Automatically generates 3D-flipping flashcards for active recall and memorization.
- **Automated Quizzes:** Tests your knowledge with a generated multiple-choice quiz featuring immediate grading and explanations.
- **Secure Authentication:** Full JWT-based user registration and login system with secure password hashing.
- **Database Caching:** Saves previously processed videos to a PostgreSQL database to eliminate duplicate AI processing costs.
- **Admin Dashboard:** A built-in portal to view registered users and processed video logs.

---

## 🛠️ Tech Stack

**Frontend:**
- [Next.js 14](https://nextjs.org/) (App Router)
- React & TypeScript
- Tailwind CSS (for styling and animations)
- Lucide React (for icons)

**Backend:**
- [FastAPI](https://fastapi.tiangolo.com/) (Python)
- Google Generative AI (`gemini-pro`)
- YouTube Transcript API
- Supabase (PostgreSQL Database)
- SQLAlchemy (ORM)
- Passlib & JWT (for secure Authentication)

---

## 🚀 Local Development Setup

Follow these steps to run the project locally on your machine.

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- A [Google AI Studio](https://aistudio.google.com/app/apikey) API Key
- A [Supabase](https://supabase.com/) Account (for the PostgreSQL database)

### 1. Clone the repository
```bash
git clone https://github.com/sankalpjaiswal013-ops/vidnotes.git
cd vidnotes
```

### 2. Backend Setup
Navigate to the backend folder and install the Python dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder and add your credentials:
```env
GEMINI_API_KEY=your_google_gemini_api_key
JWT_SECRET_KEY=super_secure_jwt_key_123
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.your-supabase-url.supabase.co:5432/postgres"
```

Initialize the database tables:
```bash
python init_db.py
```

Start the FastAPI server:
```bash
uvicorn main:app --reload
```
*(The backend will run on `http://127.0.0.1:8000`)*

### 3. Frontend Setup
Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
npm install
```

Start the Next.js development server:
```bash
npm run dev
```
*(The frontend will run on `http://localhost:3000`)*

---

## 📂 Project Structure

```text
vidnotes/
├── backend/                  # FastAPI Application
│   ├── main.py               # Application entry point
│   ├── database.py           # Database engine setup
│   ├── models.py             # SQLAlchemy schemas
│   ├── routers/              # API route controllers (auth, process, admin)
│   └── services/             # Core logic (AI Service, Transcript Extractor)
├── frontend/                 # Next.js Application
│   ├── src/app/              # Next.js App Router (Pages)
│   │   ├── auth/             # Login & Registration views
│   │   ├── admin/            # Database visualization dashboard
│   │   ├── video/[id]/       # Dynamic notes & quiz dashboard
│   │   └── page.tsx          # Homepage with URL input
│   └── tailwind.config.ts    # Styling configuration
└── README.md                 # Project documentation
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is open-source and available under the MIT License.

It’s an AI-powered Interior Designer Web App I built.

You give it the room dimensions → length and breadth in meters.

Then you add your preferences → aesthetics (like Modern, Minimalist, Cozy) and furniture (like Bed, Sofa, Desk).

You can also type a custom prompt describing what you want for the room.

Once submitted:

The app sends all this info to my backend (FastAPI in Python).

The backend runs my Llama 2 model (locally installed), so it’s private and doesn’t depend on cloud APIs.

The model generates design suggestions that are directly based on the given measurements and preferences.

At the same time, the backend creates a scaled 2D room layout using Matplotlib.

On the frontend (Next.js + Tailwind):

I show the AI’s response in a clean format → if it’s in bullet points, no numbering; if it’s in numbers, no bullets.

I also display the room layout image right below the suggestions.

So the output is always two things together:

Textual design suggestions (arrangement, aesthetics, furniture placement).

A 2D plot of the room showing the proportions.

The design is simple, neat, and fully functional.



ai-architect/
├─ backend/
│  ├─ app/
│  │  ├─ main.py         # FastAPI code (Llama2 + plotting)
│  │  └─ requirements.txt
│  └─ .venv/ (optional)
├─ frontend/
│  ├─ app/
│  │  └─ page.tsx        # Next.js page you already created
│  └─ package.json
└─ README.md

cd backend/app
python -m venv .venv
source .venv/bin/activate   # on Windows: .venv\Scripts\activate
pip install -r requirements.txt
requirements.txt should include: fastapi uvicorn ollama matplotlib seaborn python-dotenv pydantic


cd frontend
npm install
npm run dev



The idea is: get quick, AI-powered interior design suggestions + a room layout plan instantly.

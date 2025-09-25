from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import matplotlib.pyplot as plt
import seaborn as sns
import io, base64
from typing import List
from ollama import chat

# --- Models ---
class DesignRequest(BaseModel):
    length: float  # in meters
    breadth: float  # in meters
    aesthetic: str
    furniture: str
    prompt: str

class SuggestionResponse(BaseModel):
    suggestions: str | None = None
    plot_base64: str | None = None

# --- App setup ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_MODEL = "llama2"

@app.post("/design", response_model=SuggestionResponse)
async def design_room(req: DesignRequest):
    try:
        # --- 1️⃣ Text Suggestions ---
        system_prompt = "You are a professional interior designer. Give clear, practical suggestions."
        user_prompt = (
            f"Room dimensions: {req.length}m x {req.breadth}m\n"
            f"Aesthetic: {req.aesthetic}\n"
            f"Furnitures: {req.furniture}\n"
            f"User prompt: {req.prompt}\n\n"
            f"Provide suggestions that respect these dimensions, aesthetics, and furniture. "
            f"Use bullet points unless the model wants to use numbering."
        )

        response = chat(
            model=OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )

        if response and "message" in response and "content" in response["message"]:
            suggestions = response["message"]["content"].strip()
        else:
            suggestions = "No suggestions generated."

        # --- 2️⃣ 2D Room Layout Plot ---
        furniture_list = [f.strip() for f in req.furniture.split(",") if f.strip()]
        if not furniture_list:
            furniture_list = ["Sofa", "Bed"]

        plt.figure(figsize=(req.length, req.breadth))
        sns.set(style="whitegrid")
        ax = plt.gca()

        # Predefined positions scaled to room dimensions
        positions = [
            (0.1*req.length, 0.1*req.breadth),
            (0.1*req.length, 0.8*req.breadth),
            (0.8*req.length, 0.1*req.breadth),
            (0.8*req.length, 0.8*req.breadth),
            (0.3*req.length, 0.5*req.breadth),
            (0.5*req.length, 0.3*req.breadth),
            (0.5*req.length, 0.7*req.breadth),
            (0.7*req.length, 0.5*req.breadth)
        ]

        for i, item in enumerate(furniture_list):
            x, y = positions[i % len(positions)]
            ax.scatter(x, y, s=500, marker="s", label=item)
            ax.text(x, y + 0.03*req.breadth, item, ha="center", fontsize=10)

        plt.xlim(0, req.length)
        plt.ylim(0, req.breadth)
        plt.title("Room Layout")
        plt.legend(loc="upper right", fontsize=8)

        buf = io.BytesIO()
        plt.savefig(buf, format="png", bbox_inches="tight")
        plt.close()
        buf.seek(0)
        plot_base64 = base64.b64encode(buf.read()).decode("utf-8")

        return SuggestionResponse(suggestions=suggestions, plot_base64=plot_base64)

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=f"Error generating design: {str(e)}")

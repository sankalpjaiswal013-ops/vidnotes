import google.generativeai as genai
import os
import json
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

MASTER_PROMPT = """
You are an expert note-taker and educator. You will be given a raw, unformatted transcript of a YouTube video. Your job is to convert it into complete, accurate, well-organized written content that lets a reader fully understand everything covered in the video WITHOUT needing to watch it.

Rules:
1. Do not summarize briefly — capture every distinct point, explanation, example, and detail mentioned. Length should reflect the video's actual depth.
2. Organize the content into logical sections with clear headings based on topic shifts in the video.
3. Fix grammar, remove filler words, and convert spoken language into clean written prose.
4. Preserve any numbers, statistics, names, steps, or technical details exactly as stated.
5. Do NOT add information that wasn't in the transcript. Do NOT speculate.
6. At the very end, add a section titled "Key Takeaways" that lists the 5-10 most important points from the entire video as a bulleted recap.

After the article, generate:
- FLASHCARDS: 8-12 flashcards as question/answer pairs covering key concepts.
- QUIZ: 5-8 multiple-choice questions, each with 4 options, the correct answer indicated, and a short explanation.

Return your response as valid JSON in exactly this structure:
{
  "article": {
    "sections": [{"heading": "string", "content": "string"}],
    "key_takeaways": ["string", "string"]
  },
  "flashcards": [{"front": "string", "back": "string"}],
  "quiz": [{"question": "string", "options": ["string","string","string","string"], "correct_index": 0, "explanation": "string"}]
}

Return ONLY the JSON. No markdown code fences (do not wrap in ```json), no extra text. JUST pure JSON.
"""

def generate_notes(transcript_text: str) -> dict:
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API Key is missing. Please set GEMINI_API_KEY in your .env file.")
        
    try:
        # Dynamically find an available model for this specific API key
        available_models = genai.list_models()
        model_name = None
        for m in available_models:
            if 'generateContent' in m.supported_generation_methods:
                model_name = m.name
                # Prefer flash or pro if available
                if 'flash' in model_name.lower():
                    break
                    
        if not model_name:
            raise HTTPException(status_code=500, detail="No text generation models found for this API key.")
            
        model = genai.GenerativeModel(model_name)
        
        full_prompt = f"{MASTER_PROMPT}\n\nHere is the transcript:\n{transcript_text}"
        
        response = model.generate_content(
            full_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.2
            )
        )
        
        # Parse the JSON response (strip markdown if model ignores instructions)
        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
            
        result = json.loads(raw_text.strip())
        return result
    except Exception as e:
        print(f"AI Generation Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate notes: {str(e)}")

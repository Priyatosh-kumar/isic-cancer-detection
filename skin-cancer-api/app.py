from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from pydantic import BaseModel
from typing import Dict, List
import numpy as np
import io
from PIL import Image

app = FastAPI(title="Skin Cancer CNN API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------
# CONFIG
# -----------------------------------

IMAGE_SIZE = (224, 224)

CLASS_NAMES = [
    "akiec",
    "bcc",
    "bkl",
    "df",
    "mel",
    "nv",
    "vasc",
    "scc",
    "unk"
]

FULL_CLASS_NAMES = [
    "actinic_keratosis",
    "basal_cell_carcinoma",
    "benign_keratosis",
    "dermatofibroma",
    "melanoma",
    "melanocytic_nevus",
    "vascular_lesion",
    "squamous_cell_carcinoma",
    "unknown"
]

# -----------------------------------
# CLINICAL EVALUATOR
# -----------------------------------

import json
import requests
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables.")

class RecommendationReport(BaseModel):
    top_predictions: Dict[str, float]
    is_low_confidence: bool
    is_high_risk: bool
    generated_advice: List[str]

class ClinicalEvaluator:
    async def evaluate(self, probabilities: Dict[str, float], age: int) -> RecommendationReport:
        prompt = f"""
        You are a highly experienced clinical dermatologist evaluating the output of an AI skin lesion classifier.
        The classifier has output the following probabilities for different skin conditions:
        {json.dumps(probabilities, indent=2)}
        
        The patient's age is {age}.
        
        Please evaluate these results based on strict safety rules:
        1. Low Confidence Flag: If the maximum probability across all classes is less than 0.40, set is_low_confidence to true and include this advice: "AI Confidence is Low. The model cannot confidently classify this lesion based on the current image. Please ensure the photo is taken in bright, natural light without blur."
        2. Differential Diagnosis: Return the top 3 highest probability classes and their values as top_predictions.
        3. High-Risk Override: If any of the malignant classes (melanoma, basal_cell_carcinoma, squamous_cell_carcinoma) have a probability greater than 0.05, set is_high_risk to true and include this advice: "Caution: While benign conditions may be the top statistical matches, features associated with malignancy cannot be completely ruled out. Clinical evaluation is strongly recommended."
        4. Metadata Context: If the patient's age is >= 60, include this advice: "Age-related risk factor noted. Routine screening with a dermatologist is advised."
        5. Default Advice: If NONE of the above conditions (1, 3, or 4) are met, include exactly this single advice string: "No immediate high-risk indicators were flagged by the AI. However, if the lesion is new, changing, or bleeding, consult a dermatologist."
        
        Return your response purely as a JSON object matching this exact structure:
        {{
            "top_predictions": {{"class_name": 0.0}},
            "is_low_confidence": false,
            "is_high_risk": false,
            "generated_advice": ["advice string 1", "advice string 2"]
        }}
        """
        
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"responseMimeType": "application/json"}
            }
            
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, lambda: requests.post(url, json=payload))
            response.raise_for_status()
            
            response_data = response.json()
            text_result = response_data["candidates"][0]["content"]["parts"][0]["text"]
            data = json.loads(text_result)
            return RecommendationReport(**data)
        except Exception as e:
            print(f"Gemini API error: {e}")
            return RecommendationReport(
                top_predictions={},
                is_low_confidence=False,
                is_high_risk=False,
                generated_advice=["Clinical evaluation recommended."]
            )

evaluator = ClinicalEvaluator()

# -----------------------------------
# MODEL DOWNLOAD + LOAD
# -----------------------------------

def ensure_model(model_path: str, gdrive_url: str):
    """Download the model from Google Drive if not present or empty locally."""
    if os.path.exists(model_path) and os.path.getsize(model_path) > 0:
        print(f"Model found at '{model_path}'.")
        return

    print(f"Model not found at '{model_path}'. Attempting download from Google Drive...")
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    try:
        import gdown
        gdown.download(gdrive_url, model_path, quiet=False)
        print("Download complete.")
    except Exception as e:
        raise RuntimeError(
            f"Model file '{model_path}' is missing and could not be downloaded: {e}\n"
            "Please ensure the Google Drive file is shared as 'Anyone with the link can view' "
            "and place the model file manually at the expected path."
        ) from e

CNN_MODEL_URL = os.getenv("CNN_MODEL_URL", "https://drive.google.com/file/d/1Qnyshey6Qk-jADI-DlkSJCgn_Npp-ZY0/view?usp=drive_link")
CNN_MODEL_PATH = "models/cnn.keras"

ensure_model(CNN_MODEL_PATH, CNN_MODEL_URL)

print("Loading CNN model...")
cnn_model = load_model(CNN_MODEL_PATH, compile=False)
print("CNN model loaded successfully!")

# -----------------------------------
# IMAGE PREPROCESSING
# -----------------------------------

def preprocess_image(file) -> np.ndarray:
    """
    Convert uploaded image into model input
    """

    img = Image.open(
        io.BytesIO(file)
    ).convert("RGB")

    img = img.resize(IMAGE_SIZE)

    img_array = np.array(img).astype("float32")

    # Same normalization as training
    img_array = img_array / 255.0

    img_array = np.expand_dims(
        img_array,
        axis=0
    )

    return img_array


# -----------------------------------
# HOME ROUTE
# -----------------------------------

@app.get("/")
def home():
    return {
        "message": "Skin Cancer CNN API is running"
    }


# -----------------------------------
# PREDICT ROUTE
# -----------------------------------

@app.post("/predict")
async def predict(file: UploadFile = File(...), age: int = Form(0)):

    try:
        # Read uploaded image
        contents = await file.read()

        # Preprocess image
        img_array = preprocess_image(contents)

        # Predict
        prediction = cnn_model.predict(
            img_array,
            verbose=0
        )

        prob_array = prediction.tolist()[0]
        
        predicted_class = int(
            np.argmax(prediction, axis=1)[0]
        )

        predicted_label = CLASS_NAMES[
            predicted_class
        ]

        confidence = float(
            prediction[0][predicted_class]
        )
        
        # Build prob dict for evaluator
        prob_dict = {FULL_CLASS_NAMES[i]: prob_array[i] for i in range(len(FULL_CLASS_NAMES))}
        
        # Evaluate
        report = await evaluator.evaluate(prob_dict, age)

        # Response
        return {
            "filename": file.filename,
            "predicted_class": predicted_label,
            "confidence": round(confidence, 6),
            "all_probabilities": [prob_array],
            "evaluation": report.model_dump()
        }

    except Exception as e:
        return {
            "error": str(e)
        }
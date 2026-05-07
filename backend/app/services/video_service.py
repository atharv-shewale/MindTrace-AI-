import pandas as pd
import random
import os
import logging

logger = logging.getLogger(__name__)

class VideoService:
    def __init__(self):
        self.csv_path = "mindtrace_emotion_video_dataset.csv"
        self._data = None
        self._load_data()

    def _load_data(self):
        try:
            if os.path.exists(self.csv_path):
                self._data = pd.read_csv(self.csv_path)
                logger.info(f"Loaded {len(self._data)} video suggestions from {self.csv_path}")
            else:
                logger.warning(f"Video dataset not found at {self.csv_path}")
        except Exception as e:
            logger.error(f"Error loading video dataset: {e}")

    def get_video_for_emotion(self, emotion: str) -> str:
        """
        Map a detected emotion to a category and return a random YouTube link.
        Categories in CSV: Laugh, Sad Recovery, Motivation, Calm Down, Anxiety Relief, Focus Music
        """
        if self._data is None:
            return "https://www.youtube.com/watch?v=dQw4w9WgXcQ" # Standard fallback

        # Mapping logic
        mapping = {
            "joy": "Laugh",
            "happiness": "Laugh",
            "sadness": "Sad Recovery",
            "sad": "Sad Recovery",
            "anger": "Calm Down",
            "fear": "Anxiety Relief",
            "anxiety": "Anxiety Relief",
            "neutral": "Focus Music",
            "surprise": "Motivation",
            "disgust": "Calm Down",
            "frustration": "Calm Down",
            "depressed": "Motivation"
        }

        category = mapping.get(emotion.lower(), "Motivation")
        
        # Filter data
        filtered = self._data[self._data['Category'] == category]
        
        if filtered.empty:
            # Fallback to random if category not found
            return random.choice(self._data['YouTube_Link'].tolist()) if not self._data.empty else "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

        return random.choice(filtered['YouTube_Link'].tolist())

video_service = VideoService()

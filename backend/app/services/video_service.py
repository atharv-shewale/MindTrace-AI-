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
                # Clean up categories (strip whitespace) for robust matching
                self._data['Category'] = self._data['Category'].str.strip()
                logger.info(f"Loaded {len(self._data)} video suggestions from {self.csv_path}")
            else:
                logger.warning(f"Video dataset not found at {self.csv_path}")
        except Exception as e:
            logger.error(f"Error loading video dataset: {e}")

    def get_video_for_emotion(self, emotion: str) -> str:
        """
        Map a detected emotion to a category and return a random YouTube link.
        Strictly uses the CSV dataset provided.
        """
        if self._data is None or self._data.empty:
            return "https://www.youtube.com/watch?v=mgmVOuLgFB0" # Safe internal fallback (Sad Recovery)

        # Mapping logic based on CSV categories: Laugh, Sad Recovery, Motivation, Calm Down, Anxiety, Focus Music
        mapping = {
            "joy": "Laugh",
            "happiness": "Laugh",
            "sadness": "Sad Recovery",
            "sad": "Sad Recovery",
            "anger": "Calm Down",
            "fear": "Anxiety",
            "anxiety": "Anxiety",
            "neutral": "Focus Music",
            "surprise": "Motivation",
            "disgust": "Calm Down",
            "frustration": "Calm Down",
            "depressed": "Sad Recovery",
            "lonely": "Sad Recovery"
        }

        category = mapping.get(emotion.lower(), "Motivation")
        
        # Filter data from the CSV strictly
        filtered = self._data[self._data['Category'] == category]
        
        if filtered.empty:
            # If the mapped category isn't in CSV, fallback to a general 'Motivation' link from the CSV
            fallback = self._data[self._data['Category'] == "Motivation"]
            if not fallback.empty:
                return random.choice(fallback['YouTube_Link'].tolist())
            return random.choice(self._data['YouTube_Link'].tolist())

        return random.choice(filtered['YouTube_Link'].tolist())

video_service = VideoService()

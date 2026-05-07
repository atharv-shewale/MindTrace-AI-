import pandas as pd
import random
import os
import logging

logger = logging.getLogger(__name__)

class VideoService:
    def __init__(self):
        self.csv_path = "mindtrace_emotional_support_dataset.csv"
        self._data = None
        self._load_data()

    def _load_data(self):
        try:
            if os.path.exists(self.csv_path):
                self._data = pd.read_csv(self.csv_path)
                # Clean up emotion strings
                self._data['emotion'] = self._data['emotion'].str.strip().str.lower()
                logger.info(f"Loaded {len(self._data)} support suggestions from {self.csv_path}")
            else:
                logger.warning(f"Support dataset not found at {self.csv_path}")
        except Exception as e:
            logger.error(f"Error loading support dataset: {e}")

    def get_video_for_emotion(self, emotion: str) -> str:
        """
        Strictly uses the 'mindtrace_emotional_support_dataset.csv'
        """
        if self._data is None or self._data.empty:
            return "https://www.youtube.com/watch?v=mgmVOuLgFB0"

        search_emotion = emotion.lower().strip()
        
        # Direct filter on the 'emotion' column
        filtered = self._data[self._data['emotion'] == search_emotion]
        
        if filtered.empty:
            # Fallback mapping for emotions not explicitly in CSV
            mapping = {
                "joy": "burnout", # Just to get something positive/calm
                "happiness": "burnout",
                "neutral": "stress",
                "fear": "anxiety",
                "frustration": "anger",
                "depressed": "sadness",
                "lonely": "sadness"
            }
            mapped_emotion = mapping.get(search_emotion, "stress")
            filtered = self._data[self._data['emotion'] == mapped_emotion]

        if not filtered.empty:
            return random.choice(filtered['youtube_link'].tolist())
        
        return random.choice(self._data['youtube_link'].tolist()) if not self._data.empty else "https://www.youtube.com/watch?v=mgmVOuLgFB0"

video_service = VideoService()

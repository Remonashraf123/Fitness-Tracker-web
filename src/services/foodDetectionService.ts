import axios from 'axios';

const ROBOFLOW_API_KEY = 'mB58jAtmWKlO3h0jcKRz';
const GEMINI_API_KEY = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=GEMINI_API_KEY"

interface RoboflowPrediction {
  class: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FoodDetectionResult {
  predictions: RoboflowPrediction[];
  calories?: string;
}

export const detectFood = async (imageData: string): Promise<FoodDetectionResult> => {
  try {
    // Convert base64 to blob
    const base64Data = imageData.split(',')[1];
    const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());

    // Create form data for Roboflow
    const formData = new FormData();
    formData.append('file', blob, 'image.jpg');

    // Call Roboflow API
    const roboflowResponse = await axios.post(
      `https://serverless.roboflow.com/calorie-tracker-pmuck/4?api_key=${ROBOFLOW_API_KEY}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const predictions = roboflowResponse.data.predictions;
    const foodItems = predictions.map((pred: RoboflowPrediction) => pred.class).join(', ');

    // Call Gemini API for calorie estimation
    if (foodItems) {
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `Estimate total calories for a plate containing: ${foodItems}. Just give a number and the total description.`
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        predictions,
        calories: geminiResponse.data.candidates[0].content.parts[0].text
      };
    }

    return { predictions };
  } catch (error) {
    console.error('Error in food detection:', error);
    throw error;
  }
}; 
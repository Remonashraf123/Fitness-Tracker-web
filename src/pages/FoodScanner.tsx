import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';

interface FoodItem {
  name: string;
  calories: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  description?: string;
}

const FOOD_DATABASE: Record<string, { calories: string, protein: string, carbs: string, fat: string }> = {
  burger: { calories: "550", protein: "25", carbs: "45", fat: "30" },
  pizza: { calories: "285", protein: "12", carbs: "36", fat: "10" },
  salad: { calories: "150", protein: "5", carbs: "20", fat: "8" },
  sandwich: { calories: "350", protein: "15", carbs: "40", fat: "12" },
  pasta: { calories: "400", protein: "12", carbs: "75", fat: "5" },
  rice: { calories: "200", protein: "4", carbs: "45", fat: "0.5" },
  grilled_chicken: { calories: "165", protein: "31", carbs: "0", fat: "3.6" },
  steak: { calories: "271", protein: "25", carbs: "0", fat: "19" },
  boiled_egg: { calories: "78", protein: "6", carbs: "0.6", fat: "5.3" },
  apple: { calories: "95", protein: "0.5", carbs: "25", fat: "0.3" },
  banana: { calories: "105", protein: "1.3", carbs: "27", fat: "0.3" },
  orange: { calories: "62", protein: "1.2", carbs: "15.4", fat: "0.2" },
  avocado: { calories: "240", protein: "3", carbs: "12", fat: "22" },
  oats: { calories: "150", protein: "5", carbs: "27", fat: "3" },
  yogurt: { calories: "100", protein: "10", carbs: "8", fat: "2" },
  milk: { calories: "103", protein: "8", carbs: "12", fat: "2.4" },
  almonds: { calories: "170", protein: "6", carbs: "6", fat: "15" },
  peanut_butter: { calories: "188", protein: "8", carbs: "6", fat: "16" },
  fish_salmon: { calories: "206", protein: "22", carbs: "0", fat: "13" },
  fries: { calories: "365", protein: "3.4", carbs: "63", fat: "17" },
  ice_cream: { calories: "207", protein: "3.5", carbs: "24", fat: "11" },
  chocolate: { calories: "546", protein: "4.9", carbs: "61", fat: "31" },
  soda: { calories: "140", protein: "0", carbs: "39", fat: "0" },
  water: { calories: "0", protein: "0", carbs: "0", fat: "0" }
};

  // Add more food items as needed

const FoodScannerPage: React.FC = () => {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scannedFood, setScannedFood] = useState<FoodItem | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectedItems, setDetectedItems] = useState<string[]>([]);
  const [lastQueryTime, setLastQueryTime] = useState(0);
  
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, []);

  // Toggle camera
  const toggleCamera = () => {
    if (cameraEnabled) {
      stopCamera();
    } else {
      startCamera();
    }
  };
  
  const startCamera = () => {
    setCameraEnabled(true);
  };
  
  const stopCamera = () => {
    setCameraEnabled(false);
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
  };
  
  const handleCameraReady = () => {
    startDetection();
  };

  // Start periodic detection when camera is ready
  const startDetection = () => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }
    
    detectionInterval.current = setInterval(() => {
      if (webcamRef.current && webcamRef.current.video) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          detectFood(imageSrc);
        }
      }
    }, 2000); // Detect every 2 seconds
  };

  // Detect food using Roboflow API
  const detectFood = async (imageBase64: string) => {
    setIsLoading(true);
    try {
      const response = await axios({
        method: "POST",
        url: "https://serverless.roboflow.com/calorie-tracker-pmuck/4",
        params: {
          api_key: "mB58jAtmWKlO3h0jcKRz"
        },
        data: imageBase64.split(',')[1],
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      const predictions = response.data.predictions;
      
      if (!predictions || predictions.length === 0) {
        throw new Error('No food detected in image');
      }

      const topPrediction = predictions[0];
      const foodName = topPrediction.class.toLowerCase();
      
      // Get nutrition data from database or use calculated values
      const nutritionData = FOOD_DATABASE[foodName] || {
        calories: Math.round(300 * topPrediction.confidence).toString(),
        protein: Math.round(12 * topPrediction.confidence).toString(),
        carbs: Math.round(40 * topPrediction.confidence).toString(),
        fat: Math.round(10 * topPrediction.confidence).toString(),
      };

      setScannedFood({
        name: topPrediction.class,
        ...nutritionData,
        description: `Detected ${topPrediction.class} with ${(topPrediction.confidence * 100).toFixed(2)}% confidence`
      });
      setDetectedItems([topPrediction.class]);

    } catch (error) {
      console.error("Food detection error:", error);
      setScannedFood({
        name: "Error",
        calories: "0",
        protein: "0",
        carbs: "0",
        fat: "0",
        description: error instanceof Error ? error.message : "Failed to analyze image"
      });
      setDetectedItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageSrc = e.target?.result as string;
      setUploadedImage(imageSrc);
      await detectFood(imageSrc);
    };
    reader.readAsDataURL(file);
  };

  // Take screenshot from webcam
  const captureImage = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setUploadedImage(imageSrc);
        await detectFood(imageSrc);
        stopCamera();
      }
    }
  };

  // Reset everything
  const resetScan = () => {
    setUploadedImage(null);
    setScannedFood(null);
    setDetectedItems([]);
  };

  // Add to food diary
  const addToFoodDiary = () => {
    alert(`Added ${scannedFood?.name} to your food diary!`);
    resetScan();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">AI Food Scanner</h1>
        <p className="text-muted-foreground mb-8">Scan your food to get nutrition information</p>
        
        <Card>
          <CardContent className="pt-6">
            {!cameraEnabled && !scannedFood && (
              <div className="space-y-4">
                <Button className="w-full" variant="default" onClick={toggleCamera}>
                  <Camera className="mr-2 h-4 w-4" /> Use Camera
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">or</div>
                
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload Image
                </Button>
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>
            )}

            {cameraEnabled && (
              <div className="relative">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: "environment"
                  }}
                  onUserMedia={handleCameraReady}
                  className="w-full h-auto rounded-lg"
                />
                
                {detectedItems.length > 0 && (
                  <div className="absolute top-4 left-4 right-4 bg-black bg-opacity-70 text-white p-2 rounded">
                    <p className="text-sm font-medium">Detected: {detectedItems.join(', ')}</p>
                  </div>
                )}
                
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="p-4 bg-white rounded-full shadow-lg"
                    onClick={captureImage}
                  >
                    <Camera className="h-6 w-6 text-primary-600" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="p-4 bg-white rounded-full shadow-lg"
                    onClick={toggleCamera}
                  >
                    <X className="h-6 w-6 text-red-500" />
                  </motion.button>
                </div>
              </div>
            )}

            {scannedFood && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{scannedFood.name}</h2>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="font-semibold">{scannedFood.calories}</div>
                    <div className="text-sm text-muted-foreground">Calories</div>
                  </div>
                  <div>
                    <div className="font-semibold">{scannedFood.protein}g</div>
                    <div className="text-sm text-muted-foreground">Protein</div>
                  </div>
                  <div>
                    <div className="font-semibold">{scannedFood.carbs}g</div>
                    <div className="text-sm text-muted-foreground">Carbs</div>
                  </div>
                </div>
                <Alert>
                  <AlertDescription>
                    {scannedFood.description}
                  </AlertDescription>
                </Alert>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setScannedFood(null)}
                >
                  Scan Another Food
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FoodScannerPage;
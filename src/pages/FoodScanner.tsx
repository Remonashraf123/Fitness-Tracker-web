import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, X, MessageCircle, Send, Mic, MicOff } from 'lucide-react';
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

const FOOD_DATABASE: Record<string, { calories: string, protein: string, carbs: string, fat: string, servingSize: number }> = {
  // Basic foods
  rice: { calories: "200", protein: "4", carbs: "45", fat: "0.5", servingSize: 100 },
  bread: { calories: "265", protein: "9", carbs: "49", fat: "3.2", servingSize: 100 },
  pasta: { calories: "158", protein: "5.8", carbs: "31", fat: "0.9", servingSize: 100 },
  oats: { calories: "389", protein: "16.9", carbs: "66", fat: "6.9", servingSize: 100 },
  quinoa: { calories: "120", protein: "4.4", carbs: "21", fat: "1.9", servingSize: 100 },

  // Proteins
  chicken: { calories: "165", protein: "31", carbs: "0", fat: "3.6", servingSize: 100 },
  salmon: { calories: "208", protein: "22", carbs: "0", fat: "13", servingSize: 100 },
  tuna: { calories: "144", protein: "30", carbs: "0", fat: "1", servingSize: 100 },
  steak: { calories: "250", protein: "26", carbs: "0", fat: "17", servingSize: 100 },
  pork: { calories: "242", protein: "25", carbs: "0", fat: "16", servingSize: 100 },
  turkey: { calories: "189", protein: "29", carbs: "0", fat: "7.5", servingSize: 100 },
  egg: { calories: "155", protein: "13", carbs: "1.1", fat: "11", servingSize: 100 },
  tofu: { calories: "76", protein: "8", carbs: "1.9", fat: "4.8", servingSize: 100 },
  meat: { calories: "192", protein: "20.3", carbs: "7.6", fat: "10.8", servingSize: 100 },
  
  // Vegetables
  broccoli: { calories: "55", protein: "3.7", carbs: "11.2", fat: "0.6", servingSize: 100 },
  spinach: { calories: "23", protein: "2.9", carbs: "3.6", fat: "0.4", servingSize: 100 },
  carrot: { calories: "41", protein: "0.9", carbs: "9.6", fat: "0.2", servingSize: 100 },
  potato: { calories: "77", protein: "2", carbs: "17", fat: "0.1", servingSize: 100 },
  sweet_potato: { calories: "86", protein: "1.6", carbs: "20", fat: "0.1", servingSize: 100 },
  cucumber: { calories: "15", protein: "0.6", carbs: "3.6", fat: "0.2", servingSize: 100 },
  tomato: { calories: "18", protein: "0.9", carbs: "3.9", fat: "0.2", servingSize: 100 },
  lettuce: { calories: "15", protein: "1.4", carbs: "2.9", fat: "0.2", servingSize: 100 },
  
  // Fruits
  apple: { calories: "52", protein: "0.3", carbs: "14", fat: "0.2", servingSize: 100 },
  banana: { calories: "89", protein: "1.1", carbs: "23", fat: "0.3", servingSize: 100 },
  orange: { calories: "47", protein: "0.9", carbs: "12", fat: "0.1", servingSize: 100 },
  grape: { calories: "69", protein: "0.7", carbs: "18", fat: "0.2", servingSize: 100 },
  strawberry: { calories: "33", protein: "0.7", carbs: "8", fat: "0.3", servingSize: 100 },
  blueberry: { calories: "57", protein: "0.7", carbs: "14", fat: "0.3", servingSize: 100 },
  mango: { calories: "60", protein: "0.8", carbs: "15", fat: "0.4", servingSize: 100 },
  
  // Dairy
  milk: { calories: "42", protein: "3.4", carbs: "5", fat: "1", servingSize: 100 },
  yogurt: { calories: "59", protein: "3.5", carbs: "4.7", fat: "3.3", servingSize: 100 },
  cheese: { calories: "402", protein: "25", carbs: "1.3", fat: "33", servingSize: 100 },
  cottage: { calories: "98", protein: "11", carbs: "3.4", fat: "4.3", servingSize: 100 },
  
  // Nuts and Seeds
  almonds: { calories: "579", protein: "21", carbs: "22", fat: "50", servingSize: 100 },
  walnuts: { calories: "654", protein: "15", carbs: "14", fat: "65", servingSize: 100 },
  peanuts: { calories: "567", protein: "26", carbs: "16", fat: "49", servingSize: 100 },
  chia_seeds: { calories: "486", protein: "17", carbs: "42", fat: "31", servingSize: 100 },
  
  // Prepared Foods
  pizza: { calories: "266", protein: "11", carbs: "33", fat: "10", servingSize: 100 },
  burger: { calories: "295", protein: "17", carbs: "24", fat: "14", servingSize: 100 },
  sandwich: { calories: "250", protein: "12", carbs: "27", fat: "9", servingSize: 100 },
  sushi_roll: { calories: "145", protein: "5.8", carbs: "27", fat: "1.2", servingSize: 100 },
  
  // Snacks
  chips: { calories: "536", protein: "7", carbs: "53", fat: "34", servingSize: 100 },
  popcorn: { calories: "375", protein: "11", carbs: "74", fat: "4", servingSize: 100 },
  chocolate: { calories: "545", protein: "4.9", carbs: "61", fat: "31", servingSize: 100 },
  cookie: { calories: "353", protein: "3.8", carbs: "63", fat: "9.1", servingSize: 100 },
  
  // Beverages
  coffee: { calories: "1", protein: "0.1", carbs: "0", fat: "0", servingSize: 100 },
  tea: { calories: "1", protein: "0", carbs: "0.2", fat: "0", servingSize: 100 },
  soda: { calories: "41", protein: "0", carbs: "10.6", fat: "0", servingSize: 100 },
  juice_orange: { calories: "45", protein: "0.7", carbs: "10.4", fat: "0.2", servingSize: 100 },
  
  // International Foods
  sushi: { calories: "145", protein: "5.8", carbs: "27", fat: "1.2", servingSize: 100 },
  hummus: { calories: "166", protein: "8", carbs: "14", fat: "10", servingSize: 100 },
  falafel: { calories: "333", protein: "13", carbs: "32", fat: "18", servingSize: 100 },
  curry: { calories: "243", protein: "9.5", carbs: "16", fat: "15", servingSize: 100 },
  
  // Breakfast Items
  pancake: { calories: "227", protein: "6.4", carbs: "28", fat: "9.8", servingSize: 100 },
  waffle: { calories: "291", protein: "8", carbs: "34", fat: "14", servingSize: 100 },
  cereal: { calories: "379", protein: "7", carbs: "85", fat: "0.8", servingSize: 100 },
  granola: { calories: "471", protein: "10", carbs: "64", fat: "20", servingSize: 100 }
};

  // Add more food items as needed

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const generateMealPlan = (type: string) => {
  const mealPlans = {
    lowCarb: `Here's a low-carb meal plan (1500-1800 calories):
Breakfast: 2 eggs with spinach and cheese
Lunch: 150g grilled chicken with salad
Snack: 30g almonds
Dinner: 200g salmon with broccoli`,
    
    highProtein: `Here's a high-protein meal plan (2000-2200 calories):
Breakfast: Protein shake with 100g oats
Lunch: 200g chicken with 100g rice
Snack: Greek yogurt with protein bar
Dinner: 200g steak with sweet potato`,
    
    balanced: `Here's a balanced meal plan (1800-2000 calories):
Breakfast: 100g oats with banana and milk
Lunch: 150g chicken with 100g rice and vegetables
Snack: Apple with 30g peanut butter
Dinner: 150g fish with quinoa and vegetables`,

    weightLoss: `Here's a weight loss meal plan (1200-1500 calories):
Breakfast: Greek yogurt with berries
Lunch: Large salad with 100g tuna
Snack: Carrot sticks with hummus
Dinner: 120g chicken breast with vegetables`
  };

  return mealPlans[type] || mealPlans.balanced;
};

const FoodScannerPage: React.FC = () => {
  // Add new state for weight
  const [foodWeight, setFoodWeight] = useState<number>(100);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scannedFood, setScannedFood] = useState<FoodItem | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectedItems, setDetectedItems] = useState<string[]>([]);
  const [lastQueryTime, setLastQueryTime] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const autoCaptureTimeout = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
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
    // Set timeout to capture image after 10 seconds
    autoCaptureTimeout.current = setTimeout(() => {
      captureImage();
    }, 10000);
  };
  
  const stopCamera = () => {
    setCameraEnabled(false);
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
    if (autoCaptureTimeout.current) {
      clearTimeout(autoCaptureTimeout.current);
      autoCaptureTimeout.current = null;
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
        url: "https://serverless.roboflow.com/food-image-segmentation-yolov5/2",
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
      const foodName = topPrediction.class.toLowerCase().replace(/\s+/g, '_');
      
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
      setFoodWeight(100); // Reset weight to default
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

  // Handle chat submission
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user' as const,
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Check if message is asking for meal plan
    const message = inputMessage.toLowerCase();
    let response: ChatMessage;

    if (message.includes('meal plan') || message.includes('diet') || message.includes('نظام غذائي')) {
      let planType = 'balanced';
      if (message.includes('low carb')) planType = 'lowCarb';
      if (message.includes('high protein')) planType = 'highProtein';
      if (message.includes('weight loss')) planType = 'weightLoss';

      response = {
        role: 'assistant',
        content: generateMealPlan(planType)
      };
    } else if (message.match(/\d+\s*g/)) {
      // Calculate nutrition for specific food
      response = {
        role: 'assistant',
        content: calculateNutrition(inputMessage)
      };
    } else {
      response = {
        role: 'assistant',
        content: `I can help you with:
- Meal plans (try asking for "meal plan", "low carb diet", "high protein diet", or "weight loss diet")
- Nutrition calculations (e.g., "100g chicken")
What would you like to know?`
      };
    }

    setMessages(prev => [...prev, response]);
  };

  const calculateNutrition = (input: string) => {
    const regex = /(\d+)\s*(g|grams|slice[s]?)\s+(.+)/i;
    const match = input.match(regex);
    
    if (!match) return "Please specify the amount in grams (e.g., '100g chicken' or '200g rice')";
    
    const [_, amount, unit, foodName] = match;
    const foodKey = foodName.toLowerCase().replace(/\s+/g, '_');
    const weightInGrams = parseInt(amount);

    const foodData = FOOD_DATABASE[foodKey];
    if (!foodData) return `Sorry, I don't have information about ${foodName}`;

    // Calculate nutrition based on weight ratio
    const ratio = weightInGrams / foodData.servingSize;
    const calculatedNutrition = {
      calories: Math.round(parseFloat(foodData.calories) * ratio),
      protein: Math.round(parseFloat(foodData.protein) * ratio * 10) / 10,
      carbs: Math.round(parseFloat(foodData.carbs) * ratio * 10) / 10,
      fat: Math.round(parseFloat(foodData.fat) * ratio * 10) / 10
    };

    return `
Nutrition for ${weightInGrams}g of ${foodName}:
Calories: ${calculatedNutrition.calories} kcal
Protein: ${calculatedNutrition.protein}g
Carbs: ${calculatedNutrition.carbs}g
Fat: ${calculatedNutrition.fat}g
(Based on serving size of ${foodData.servingSize}g)
    `;
  };

  // Add speech recognition setup
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Add function to update nutrition based on weight
  const updateNutritionByWeight = (weight: number) => {
    if (!scannedFood) return;
    
    const foodName = scannedFood.name.toLowerCase().replace(/\s+/g, '_');
    const baseData = FOOD_DATABASE[foodName];
    if (!baseData) return;

    const ratio = weight / baseData.servingSize;
    setScannedFood({
      ...scannedFood,
      calories: Math.round(parseFloat(baseData.calories) * ratio).toString(),
      protein: Math.round(parseFloat(baseData.protein) * ratio * 10) / 10 + '',
      carbs: Math.round(parseFloat(baseData.carbs) * ratio * 10) / 10 + '',
      fat: Math.round(parseFloat(baseData.fat) * ratio * 10) / 10 + ''
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Chat Toggle Button - Only show when chat is closed */}
      <motion.button
        onClick={() => setIsChatOpen(true)}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed right-6 bottom-6 z-50 p-4 bg-primary text-white rounded-full shadow-lg ${
          isChatOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        } transition-opacity duration-300`}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      {/* Chat Side Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-96 transform transition-all duration-300 ease-in-out z-40 ${
          isChatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.9) 0%, rgba(35, 35, 35, 0.8) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div className="h-full flex flex-col">
          {/* Header with close button */}
          <div className="p-4 border-b border-border/30 bg-background/5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white/90">Calories AI</h2>
              <motion.button
                onClick={() => setIsChatOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-5 w-5 text-white/80" />
              </motion.button>
            </div>
          </div>

          {/* Messages Area - تحديث خلفية وألوان منطقة الرسائل */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-primary/90 text-primary-foreground backdrop-blur-sm'
                      : 'bg-white/10 text-white/90 backdrop-blur-sm'
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans text-sm">{msg.content}</pre>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border/30 bg-background/5">
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <Button 
                type="button" 
                size="icon" 
                variant={isListening ? "destructive" : "secondary"}
                className="rounded-full bg-white/10 hover:bg-white/20"
                onClick={toggleListening}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Enter food and amount (e.g., 100g chicken)"
                className="flex-1 px-4 py-2 text-sm bg-white/10 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-white/50"
              />
              <Button type="submit" size="icon" className="rounded-full bg-primary/90 hover:bg-primary/80">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">AI Food Scanner</h1>
        <p className="text-muted-foreground mb-8">Scan your food to get nutrition information</p>
        
        <Card>
          <CardContent className="pt-6">
            {scannedFood && (
              <div className="space-y-4">
                {/* Add uploaded image display here */}
                {uploadedImage && (
                  <div className="relative rounded-lg overflow-hidden">
                    <img 
                      src={uploadedImage} 
                      alt="Analyzed food" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                <h2 className="text-xl font-semibold">{scannedFood.name}</h2>
                
                {/* Add weight input */}
                <div className="flex items-center gap-2 mb-4">
                  <label className="text-sm text-muted-foreground">Weight (g):</label>
                  <input
                    type="number"
                    value={foodWeight}
                    onChange={(e) => {
                      const weight = Math.max(1, parseInt(e.target.value) || 0);
                      setFoodWeight(weight);
                      updateNutritionByWeight(weight);
                    }}
                    className="w-24 px-2 py-1 border rounded-md"
                    min="1"
                  />
                </div>

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

            {/* Remove the image display from the upload section */}
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

            {/* Replace the old circular statistics section with this new one */}
            {scannedFood && (
              <div className="mt-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {/*
                    { label: 'Calories', value: scannedFood.calories, max: 2500, unit: 'kcal', color: 'text-orange-500' },
                    { label: 'Protein', value: scannedFood.protein, max: 50, unit: 'g', color: 'text-blue-500' },
                    { label: 'Carbs', value: scannedFood.carbs, max: 300, unit: 'g', color: 'text-green-500' },
                    { label: 'Fat', value: scannedFood.fat, max: 65, unit: 'g', color: 'text-red-500' }
                  */}
                  {['calories', 'protein', 'carbs', 'fat'].map((stat) => (
                    <div key={stat} className="relative flex flex-col items-center">
                      <div className="relative w-28 h-28">
                        {/* Background circle */}
                        <svg className="w-full h-full -rotate-90 transform">
                          <circle
                            className="text-gray-100"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="42"
                            cx="56"
                            cy="56"
                          />
                          {/* Progress circle */}
                          <circle
                            className={`${
                              stat === 'calories'
                                ? 'text-orange-500'
                                : stat === 'protein'
                                ? 'text-blue-500'
                                : stat === 'carbs'
                                ? 'text-green-500'
                                : 'text-red-500'
                            } transition-all duration-500 ease-out`}
                            strokeWidth="8"
                            strokeDasharray={`${(parseInt(scannedFood[stat]) / 100) * 264} 264`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="42"
                            cx="56"
                            cy="56"
                          />
                        </svg>
                        {/* Center text */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                          <div className="text-xl font-bold">{scannedFood[stat]}</div>
                          <div className="text-xs text-gray-500">{stat !== 'calories' ? 'g' : 'kcal'}</div>
                        </div>
                      </div>
                      <span className="mt-3 text-sm font-medium text-gray-700 capitalize">{stat}</span>
                      <span className="text-xs text-gray-500">{Math.round((parseInt(scannedFood[stat]) / 100) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Add type declaration for WebkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export default FoodScannerPage;
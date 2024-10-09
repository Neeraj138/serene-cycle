// Imports
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export const getRecommendationsFromGemini = async (data) => {
  // Initialize Google Generative AI with your API key
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  // Define schema for the structured response
  const schema = {
    description: "Recommendations for food and workouts based on user data",
    type: SchemaType.OBJECT,
    properties: {
      food: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.STRING,
          description: "Name of the food item",
          nullable: false,
        },
      },
      workouts: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.STRING,
          description: "Name of the workout",
          nullable: false,
        },
      },
    },
    required: ["food", "workouts"],
  };

  // Configure the generative model
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  // Send prompt to generate content based on user input
  const result = await model.generateContent(
    `Provide personalized food and workout recommendations based on the following data:
  Symptoms/How she's feeling: ${data.symptoms},
  Menstrual Cycle Phase: ${data.probableCyclePhase},
  Next Expected Period Date: ${data.nextExpectedPeriodOnsetDate},
  Most Recent Period Date: ${data.mostRecentPeriod},
  Previous Day Sleep Data: ${data.prevDaySleepData},
  Previous Day Step Data: ${data.prevDayStepData},
  Previous Day Heartbeat Data: ${data.prevDayHeartbeatData},
  Location: Country - ${data.country}, Region - ${data.region}.
  The recommendations should be tailored to her menstrual cycle details and symptoms, aiming for balanced meals and suitable exercises.
  Give only 3-4 recommendations for both food and workouts. Make sure that the recommendations are short, crisp, straight-forward. Make sure that food recommendations are tailored to her country and region. Please return the recommendations in a structured format with food and workout lists.`
  );

  // Parse the result and log the recommendations
  const recommendationsText = result.response.text();
  let recommendations = []
  try {
    recommendations = JSON.parse(recommendationsText)
    console.log(recommendations)
  } catch (e) {
    console.log(e)
    recommendations = { food: [], workouts: [] }
  }
  console.log("Food Recommendations:", recommendations.food);
  console.log("Workout Recommendations:", recommendations.workouts);
  return recommendations;
};

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

type HealthInfo = {
  bmi: number;
  bmiCategory: string;
  healthConditions: string[];
  dietaryRestrictions: string[];
  allergies: string[];
  age: number;
  gender: string;
  activityLevel: string;
};

export async function getHealthRecommendations(healthInfo: HealthInfo) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are a nutritionist providing personalized health advice and food recommendations.
    
    User Information:
    - Age: ${healthInfo.age}
    - Gender: ${healthInfo.gender}
    - BMI: ${healthInfo.bmi} (${healthInfo.bmiCategory})
    - Activity Level: ${healthInfo.activityLevel}
    - Health Conditions: ${healthInfo.healthConditions.join(", ") || "None"}
    - Dietary Restrictions: ${healthInfo.dietaryRestrictions.join(", ") || "None"}
    - Allergies: ${healthInfo.allergies.join(", ") || "None"}
    
    Please provide:
    1. A brief analysis of the user's BMI and overall health status
    2. Personalized health advice considering their conditions and restrictions
    3. 3-5 specific Nigerian food recommendations with brief explanations why they're suitable
    4. General lifestyle recommendations
    
    Format the response in markdown with clear sections.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating health recommendations:", error);
    return "Unable to generate personalized recommendations at this time. Please try again later.";
  }
}

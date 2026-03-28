import { GoogleGenerativeAI } from "@google/generative-ai";
import { StudentProfile, ContentOutput } from "../types/student";

// Using Vite environment variables for security and GCP deployment
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const transformContent = async (
  file: File, 
  profile: StudentProfile
): Promise<ContentOutput> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  // For simulation, we'll convert the file to base64 if it's text/image/pdf
  // Real implementation would handle multiple file types through Document AI or Vision
  const reader = new FileReader();
  const fileContentPromise = new Promise<string>((resolve) => {
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
  
  await fileContentPromise;

  const prompt = `
    You are AdaptiveEd, an accessibility expert. Transform the following educational content 
    into 6 accessible formats for a student with ${profile.disability} disability.
    
    Student learning preferences: ${profile.preferences.join(', ')}.
    Target pace: ${profile.pace}x.
    
    The content is a file named "${file.name}" with type "${file.type}".
    
    REQUIRED OUTPUT JSON FORMAT:
    {
      "originalTitle": "${file.name}",
      "formats": {
        "signLanguageScript": "Detailed script for sign language interpreter",
        "screenReaderTranscript": "Semantic HTML transcript for screen readers",
        "tactileDescription": "Detailed spatial and tactile description for visual elements",
        "simplifiedText": "Content simplified to Grade 5 level",
        "kinestheticSteps": ["Actionable step 1", "Actionable step 2"],
        "summaryVariants": {
          "slow": "Detailed summary for slow pace",
          "medium": "Balanced summary",
          "fast": "Quick essence-only summary"
        },
        "flashcards": [{"question": "...", "answer": "..."}]
      }
    }
  `;

  // For demonstration, we'll send the prompt. 
  // In a production environment, we'd include the file data for Vision/Flash 1.5
  const result = await model.generateContent([prompt]);
  const responseText = result.response.text();
  
  try {
    const data = JSON.parse(responseText);
    return {
      id: Math.random().toString(36).substr(2, 9),
      originalTitle: file.name,
      formats: {
        ...data.formats,
        // Mocking the sign language video URL for now
        signLanguageVideo: "https://www.youtube.com/embed/SytfI69LhYg", 
      }
    };
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Transformation failed");
  }
};

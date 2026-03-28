import { GoogleGenerativeAI } from "@google/generative-ai";
import { analyzeVideo } from "./VideoService.js";

const API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

/**
 * Transforms educational content using Gemini 2.0 Flash
 * Supports Text, Image, Audio, and Video Analysis
 */
export const transformContent = async (file, profile) => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured on the server.");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const disabilitySummary =
    profile.disability === "None"
      ? "no specific disability reported"
      : `${profile.disability} disability`;

  // --- Step 1: Video Intelligence Analysis (if video) ---
  let videoContext = "";
  if (file.mimetype.startsWith('video/')) {
    try {
      console.log(`[AdaptiveEd Server] Analyzing video: ${file.originalname}`);
      const videoResult = await analyzeVideo(file);
      videoContext = `\n\nVideo Analysis Metadata (Scene Timing):\n${JSON.stringify(videoResult, null, 2)}`;
    } catch (vErr) {
      console.error("[AdaptiveEd Server] Video Analysis Failed (Continuing with Gemini only):", vErr);
    }
  }

  const prompt = `
    You are AdaptiveEd, an accessibility expert AI. Transform the following educational content 
    into 6 accessible formats for a student with ${disabilitySummary}.
    
    Student learning preferences: ${profile.preferences.join(", ") || "General"}.
    Target pace: ${profile.pace}x.
    
    The content is from a file named "${file.originalname}" (type: "${file.mimetype}").
    ${videoContext}
    
    REQUIRED OUTPUT — respond ONLY with valid JSON in this exact structure:
    {
      "originalTitle": "A descriptive title based on the content",
      "formats": {
        "signLanguageScript": "A detailed script suitable for a sign language interpreter, describing every concept step by step, synchronized with the video scene timing if provided",
        "screenReaderTranscript": "Semantic HTML content optimized for screen readers, using proper heading hierarchy, lists, and ARIA landmarks",
        "tactileDescription": "Detailed spatial and tactile description of all visual elements, diagrams, and spatial relationships",
        "simplifiedText": "Content simplified to Grade 5 reading level with short sentences and common words",
        "kinestheticSteps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
        "summaryVariants": {
          "slow": "A detailed, thorough summary for careful learners",
          "medium": "A balanced summary covering key points",
          "fast": "A quick essence-only summary highlighting the 3 most critical takeaways"
        },
        "flashcards": [
          {"question": "...", "answer": "..."},
          {"question": "...", "answer": "..."}
        ]
      }
    }
  `;

  try {
    const parts = [];
    
    if (file.mimetype.startsWith('text/') || file.mimetype === 'application/json') {
      parts.push({ text: prompt + "\n\nContent:\n\n" + file.buffer.toString() });
    } else {
      // Support for Images, PDFs, and Videos (Gemini 2.0 Flash handles them)
      parts.push({ text: prompt });
      parts.push({
        inlineData: {
          mimeType: file.mimetype,
          data: file.buffer.toString('base64'),
        },
      });
    }

    const result = await model.generateContent(parts);
    const responseText = result.response.text();
    const data = JSON.parse(responseText);

    return {
      id: Math.random().toString(36).substr(2, 9),
      originalTitle: data.originalTitle || file.originalname,
      formats: {
        ...data.formats,
        // In a real production system, this would call a Sign Language Synthesis API
        // Here we simulate the synthesis using the script and video timing
        signLanguageVideo: "https://www.youtube.com/embed/SytfI69LhYg",
      },
    };
  } catch (err) {
    if (err.message.includes("403") && err.message.includes("leaked")) {
      throw new Error("Gemini API Key failure: This key has been flagged as leaked by Google. Please update your .env with a new key.");
    }
    if (err.message.includes("429")) {
      throw new Error("Gemini API Quota reached: You have exceeded your free tier limit. Please wait a minute or upgrade your plan.");
    }
    if (err.message.includes("404")) {
      throw new Error(`Gemini API Error: The selected model (gemini-2.0-flash) was not found or is unavailable. [Details: ${err.message}]`);
    }
    throw err;
  }
};

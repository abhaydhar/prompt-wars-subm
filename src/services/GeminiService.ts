import { GoogleGenerativeAI } from "@google/generative-ai";
import { StudentProfile, ContentOutput } from "../types/student";

// Using Vite environment variables for security and GCP deployment
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("[AdaptiveEd] VITE_GEMINI_API_KEY is not set. Please add it to your .env file.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

/**
 * Reads a file as text content (for .txt, .csv, etc.)
 */
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};

/**
 * Reads a file as base64 data URL (for images, PDFs)
 */
const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Strip the data URL prefix to get raw base64
      resolve(result.split(",")[1] || result);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

/**
 * Checks if the file is a text-based format that can be read as plain text
 */
const isTextFile = (file: File): boolean => {
  const textTypes = ["text/plain", "text/csv", "text/markdown", "text/html", "application/json"];
  const textExtensions = [".txt", ".csv", ".md", ".json", ".html", ".htm"];
  return (
    textTypes.includes(file.type) ||
    textExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  );
};

/**
 * Checks if the file is an image
 */
const isImageFile = (file: File): boolean => {
  return file.type.startsWith("image/");
};

export const transformContent = async (
  file: File,
  profile: StudentProfile
): Promise<ContentOutput> => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const disabilitySummary =
    profile.disability === "None"
      ? "no specific disability reported"
      : `${profile.disability} disability`;

  const prompt = `
    You are AdaptiveEd, an accessibility expert AI. Transform the following educational content 
    into 6 accessible formats for a student with ${disabilitySummary}.
    
    Student learning preferences: ${profile.preferences.join(", ") || "General"}.
    Target pace: ${profile.pace}x.
    
    The content is from a file named "${file.name}" (type: "${file.type || "unknown"}").
    
    REQUIRED OUTPUT — respond ONLY with valid JSON in this exact structure:
    {
      "originalTitle": "A descriptive title based on the content",
      "formats": {
        "signLanguageScript": "A detailed script suitable for a sign language interpreter, describing every concept step by step",
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
    // Build the content parts array for Gemini
    const parts: any[] = [];

    if (isTextFile(file)) {
      // For text files, read and inline the content directly
      const textContent = await readFileAsText(file);
      if (!textContent || textContent.trim().length === 0) {
        throw new Error("The uploaded file appears to be empty.");
      }
      parts.push({ text: prompt + "\n\nHere is the educational content:\n\n" + textContent });
    } else if (isImageFile(file)) {
      // For images, send as inline data for Gemini Vision
      const base64Data = await readFileAsBase64(file);
      parts.push({ text: prompt });
      parts.push({
        inlineData: {
          mimeType: file.type,
          data: base64Data,
        },
      });
    } else {
      // For PDFs and other binary files, try to send as inline data
      // Gemini 1.5 Flash supports PDF natively
      const base64Data = await readFileAsBase64(file);
      parts.push({ text: prompt });
      parts.push({
        inlineData: {
          mimeType: file.type || "application/octet-stream",
          data: base64Data,
        },
      });
    }

    const result = await model.generateContent(parts);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    const data = JSON.parse(responseText);

    // Validate output structure
    if (!data.formats) {
      throw new Error("Invalid response format from Gemini API — missing 'formats' key.");
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      originalTitle: data.originalTitle || file.name,
      formats: {
        ...data.formats,
        // Mocking the sign language video URL (In prod, use Media Translation API)
        signLanguageVideo:
          data.formats.signLanguageVideo || "https://www.youtube.com/embed/SytfI69LhYg",
      },
    };
  } catch (err: any) {
    console.error("[AdaptiveEd] Gemini Transformation Error:", err);

    // Provide user-friendly error messages for known failure modes
    if (err.message?.includes("429")) {
      throw new Error("Rate limit exceeded. Please try again in 1 minute.");
    }
    if (err.message?.includes("API_KEY_INVALID") || err.message?.includes("401")) {
      throw new Error("Invalid API key. Please check VITE_GEMINI_API_KEY in your .env file.");
    }
    if (err.message?.includes("SAFETY")) {
      throw new Error("Content was blocked by safety filters. Please try different content.");
    }

    throw new Error(err.message || "Transformation failed. Please check your API key and file type.");
  }
};

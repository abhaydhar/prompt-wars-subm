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

/**
 * Transforms educational content by calling the AdaptiveEd Backend API
 * The backend handles the Gemini and Video Intelligence integration securely
 */
export const transformContent = async (
  file: File,
  profile: StudentProfile
): Promise<ContentOutput> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('profile', JSON.stringify(profile));

  try {
    const response = await fetch('/api/transform', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data as ContentOutput;
  } catch (err: any) {
    console.error("[AdaptiveEd] Transformation Proxy Error:", err);
    throw new Error(err.message || "Transformation failed. Please check your network connection.");
  }
};

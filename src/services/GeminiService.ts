import { StudentProfile, ContentOutput } from "../types/student";

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

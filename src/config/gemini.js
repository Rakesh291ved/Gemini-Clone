import { GoogleGenerativeAI } from "@google/generative-ai";

// Your API key
const apiKey = "AIzaSyBEE6p1MNDsOrr_x4nYjpNKNzUhQziCFFY";
const genAI = new GoogleGenerativeAI(apiKey);

// Use the model name from the latest documentation
// For text-only queries
const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// For multimodal queries (text + images)
const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

/**
 * Process a prompt with optional image data
 * @param {string} prompt - The text prompt
 * @param {Object} imageData - Optional image data object
 * @returns {string} - The response text
 */
async function run(prompt, imageData = null) {
  try {
    console.log("Sending request to Gemini API...");
    console.log("Prompt:", prompt);
    console.log("Image data present:", !!imageData);
    
    // If we have image data, use the vision model
    if (imageData) {
      console.log("Processing image data...");
      
      // Extract the base64 data from the data URL
      let base64Data = imageData.data;
      if (base64Data.includes(',')) {
        base64Data = base64Data.split(',')[1]; // Remove the data:image/jpeg;base64, part
      }
      
      // Create image part from the base64 data
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: imageData.file.type
        }
      };
      
      // Create content parts array
      const parts = [];
      
      // Add text prompt if provided
      if (prompt && prompt.trim()) {
        parts.push({ text: prompt });
      }
      
      // Add image part
      parts.push(imagePart);
      
      console.log("Sending multimodal request with parts:", parts.length);
      
      try {
        // Generate content with the vision model
        const result = await visionModel.generateContent({
          contents: [{ role: "user", parts }]
        });
        
        const response = await result.response;
        const text = response.text();
        
        console.log("Vision API response received successfully");
        return text;
      } catch (visionError) {
        console.error("Vision model error:", visionError);
        
        // If vision model fails, try with text-only as fallback
        if (prompt && prompt.trim()) {
          console.log("Falling back to text-only model");
          const textResult = await textModel.generateContent(prompt);
          const textResponse = await textResult.response;
          return textResponse.text() + "\n\n(Note: Image processing failed, this is a text-only response)";
        } else {
          return "Error processing image. Please try again with a different image or provide a text prompt.";
        }
      }
    } else {
      // Text-only query
      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        console.error('Invalid prompt:', prompt);
        return "Please provide a valid prompt.";
      }
      
      console.log("Sending text-only request");
      
      // Generate content with the text model
      const result = await textModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log("Text API response received successfully");
      return text;
    }
  } catch (error) {
    console.error('Error in Gemini API call:', error);
    return `Error: ${error.message || 'Unknown error occurred'}. Please try again.`;
  }
}

export default run;
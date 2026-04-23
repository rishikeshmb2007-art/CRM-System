const { GoogleGenAI } = require("@google/genai");

// Gemini AI Setup
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateEmail = async (req, res) => {
  try {
    // Frontend-la irundhu vara data-va edukurom
    const { leadName, companyName, leadStatus } = req.body;

    // AI-kku namma kudukkura strict instructions (Prompt)
    const prompt = `You are an expert sales executive. Write a short, professional, and convincing follow-up email to a client. 
    Client Name: ${leadName}
    Company: ${companyName}
    Current Status: ${leadStatus}
    
    Make it sound human, polite, and action-oriented. Return only the email body. Do not include the subject line.`;

    // Gemini AI kitta irundhu content vanga porom
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    // AI kudutha answer-a thirumba frontend-ku anupurom
    res.status(200).json({ emailContent: response.text });

  } catch (error) {
    console.error("AI Email Generation Error:", error);
    res.status(500).json({ message: "Failed to generate email. Check backend logs." });
  }
};

module.exports = { generateEmail };
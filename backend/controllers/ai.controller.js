// =============================================
// AI CONTROLLER
// Uses generative AI for content planning & summaries
// =============================================

/**
 * Generate a content calendar strategy using AI
 * Mocked integration for AI API (e.g. Gemini / OpenAI)
 */
export const generateContentStrategy = async (req, res) => {
  try {
    const { clientName, industry, goals } = req.body;

    // -------------------------------------------------------------------------
    // In production, integrate your AI provider (e.g., Google Gemini or OpenAI)
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    // const prompt = `Create a 4-week content strategy for ${clientName} in the ${industry} industry. Goals: ${goals}. Provide structured JSON.`;
    // const result = await model.generateContent(prompt);
    // -------------------------------------------------------------------------

    // Mocked AI Response
    const aiResponse = {
      success: true,
      strategy: [
        { week: 1, type: "Reel", theme: "Behind the Scenes", description: "Showcase the team at work to build trust." },
        { week: 2, type: "Poster", theme: "Industry Facts", description: "Educational infographic related to " + industry },
        { week: 3, type: "Reel", theme: "Client Success Story", description: "Highlight a big win achieving: " + goals },
        { week: 4, type: "Carousel", theme: "Actionable Tips", description: "3 quick tips for the audience." }
      ]
    };

    // Artificial delay to simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    res.json(aiResponse);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

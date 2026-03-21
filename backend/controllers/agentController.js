const axios = require('axios');

const LYZR_API_URL = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/';

const agents = {
  resume: '69b5032c165d3ef10c381903',
  analyzer: '69b5032d041f727c6d51597b',
  coach: '69b5032d041f727c6d51597d',
  skillGap: '69b5032da56a2d1076936125',
  test: '69b5032d165d3ef10c381907'
};

const callLyzrAgent = async (agentId, userId, message, sessionId) => {
  const optimizedMessage = message + "\n\nCRITICAL: Respond as fast as possible. Be extremely concise. Give only the exact requested output without any extra conversational filler.";
  
  try {
    const response = await axios.post(LYZR_API_URL, {
      user_id: userId,
      agent_id: agentId,
      session_id: sessionId || `${agentId}-${Date.now()}`,
      message: optimizedMessage
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.LYZR_API_KEY
      },
      timeout: 30000 // Reduced timeout to 30 seconds to fail fast
    });

    const rawData = response.data;
    console.log(`[Lyzr] Raw response keys for Agent ${agentId}:`, Object.keys(rawData));

    // Lyzr returns the actual content as a JSON string inside `response` field
    // Parse it and extract the nested `result` object
    if (rawData.response && typeof rawData.response === 'string') {
      try {
        let cleanText = rawData.response;
        // Search for markdown JSON block
        const mdMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (mdMatch) {
          cleanText = mdMatch[1];
        }
        cleanText = cleanText.trim();
        
        const parsed = JSON.parse(cleanText);
        // Extract .result if it exists, otherwise return the parsed object directly
        const result = parsed.result || parsed;
        console.log(`[Lyzr] Parsed result keys:`, Object.keys(result));
        return { result };
      } catch (parseErr) {
        // If it's not JSON, return as plain text response
        console.log(`[Lyzr] Response is plain text, returning as-is. Error:`, parseErr.message);
        return { response: rawData.response };
      }
    }

    // Fallback: return raw data
    return rawData;
  } catch (error) {
    console.error(`[Lyzr] Error for Agent ${agentId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to call AI agent');
  }
};

exports.generateResume = async (req, res) => {
  const { userId, message, sessionId } = req.body;
  try {
    const result = await callLyzrAgent(agents.resume, userId, message, sessionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyzeJD = async (req, res) => {
  const { userId, message, sessionId } = req.body;
  try {
    const result = await callLyzrAgent(agents.analyzer, userId, message, sessionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.interviewCoach = async (req, res) => {
  const { userId, message, sessionId } = req.body;
  try {
    const result = await callLyzrAgent(agents.coach, userId, message, sessionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.skillGapAnalysis = async (req, res) => {
  const { userId, message, sessionId } = req.body;
  try {
    const result = await callLyzrAgent(agents.skillGap, userId, message, sessionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.testAssessment = async (req, res) => {
  const { userId, message, sessionId } = req.body;
  try {
    const result = await callLyzrAgent(agents.test, userId, message, sessionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

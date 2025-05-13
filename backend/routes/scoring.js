import express from 'express';
import axios from 'axios';
import { storeGeneratedQA } from '../services/idealAnswers.js'; // Remove getStoredAnswer since it's not used

const router = express.Router();

// Update route path to exactly match frontend request
router.post('/score', async (req, res) => {
    try {
        const { questions, answers } = req.body;
        
        // Enhanced validation
        if (!Array.isArray(questions) || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Questions and answers must be arrays' });
        }

        if (questions.length === 0 || answers.length === 0) {
            return res.status(400).json({ message: 'Questions and answers cannot be empty' });
        }

        if (questions.length !== answers.length) {
            return res.status(400).json({ message: 'Number of questions and answers must match' });
        }

        const results = await Promise.all(questions.map(async (question, index) => {
            try {
                const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                    model: "anthropic/claude-2",
                    messages: [{
                        role: "system",
                        content: "You are an expert technical interviewer. Score the answer out of 10, provide constructive feedback, and give the ideal answer."
                    }, {
                        role: "user",
                        content: `Question: ${question}\nCandidate's Answer: ${answers[index]}\n\nPlease provide:\n1. Score (0-10)\n2. Feedback\n3. Ideal Answer`
                    }],
                    temperature: 0.7,
                    max_tokens: 500
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        'HTTP-Referer': 'http://localhost:5000',
                        'Content-Type': 'application/json'
                    }
                });

                // Validate response structure
                if (!response.data?.choices?.[0]?.message?.content) {
                    throw new Error('Invalid API response structure');
                }

                const aiResponse = response.data.choices[0].message.content;
                const analysis = parseAIResponse(aiResponse);
                
                storeGeneratedQA(question, analysis.correctAnswer);

                return {
                    question,
                    userAnswer: answers[index],
                    analysis
                };
            } catch (error) {
                console.error(`Error analyzing question ${index + 1}:`, error);
                // Return a fallback response for this question
                return {
                    question,
                    userAnswer: answers[index],
                    analysis: {
                        score: 0,
                        feedback: "Failed to analyze this response. Please try again.",
                        correctAnswer: "Analysis unavailable"
                    }
                };
            }
        }));

        // Filter out any null results
        const validResults = results.filter(Boolean);

        if (validResults.length === 0) {
            throw new Error('Failed to analyze any responses');
        }

        res.json({ 
            results: validResults,
            summary: {
                totalQuestions: validResults.length,
                averageScore: (validResults.reduce((acc, curr) => acc + curr.analysis.score, 0) / validResults.length).toFixed(2)
            }
        });
    } catch (error) {
        console.error('Scoring error:', error);
        res.status(500).json({ 
            message: 'Error processing scoring request',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

function parseAIResponse(response) {
    // Basic parsing of AI response
    return {
        score: extractScore(response) || 0,
        feedback: extractFeedback(response) || 'No feedback provided',
        correctAnswer: extractAnswer(response) || 'No ideal answer available'
    };
}

function extractScore(text) {
    const scoreMatch = text.match(/\b(?:score:?\s*)?(\d+(?:\.\d+)?)\s*(?:\/\s*10)?\b/i);
    return scoreMatch ? parseFloat(scoreMatch[1]) : 0;
}

function extractFeedback(text) {
    const feedbackMatch = text.match(/feedback:?(.*?)(?:\n|$)/i);
    return feedbackMatch ? feedbackMatch[1].trim() : '';
}

function extractAnswer(text) {
    const answerMatch = text.match(/ideal answer:?(.*?)(?:\n|$)/i);
    return answerMatch ? answerMatch[1].trim() : '';
}

export default router;

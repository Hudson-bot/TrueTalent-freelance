import express from 'express';
import { analyzeAnswer } from '../services/openRouter.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: 'Missing question or answer' });
  }

  try {
    const feedback = await analyzeAnswer(question, answer);
    res.json({ feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to analyze response' });
  }
});

export default router;

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function QuizGenerator() {
  const [url, setUrl] = useState('');
  const [resume, setResume] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const [averageScore, setAverageScore] = useState(0);
  const [showReattemptDialog, setShowReattemptDialog] = useState(false);

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!resume || !url) {
      alert('Please provide both GitHub URL and resume file.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('githubLink', url);

    try {
      const { data } = await axios.post('http://localhost:5000/api/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (!data.questions) throw new Error('No questions received from server');

      const qArray = data.questions
        .split('\n')
        .filter((q) => q.trim().length > 3);

      if (qArray.length === 0) throw new Error('No valid questions generated');

      setQuestions(qArray);
      setQuizStarted(true);
    } catch (err) {
      console.error('Error generating questions:', err);
      alert(`Failed to generate questions: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setTimeout(startListening, 1000); // Start listening 1 second after speaking ends
    };
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech Recognition not supported in this browser.');
      return;
    }

    setIsListening(true);
    setTimeLeft(60);

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript = transcript;
        } else {
          interim += transcript;
        }
      }
      setLiveTranscript(interim || finalTranscript);
    };

    recognition.start();
    recognitionRef.current = recognition;

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion(finalTranscript);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleNextQuestion = (transcript = '') => {
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Stop recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Save response
    setResponses((prev) => [...prev, transcript || liveTranscript || '[No answer provided]']);
    setLiveTranscript('');
    setIsListening(false);
    
    // Move to next question
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  useEffect(() => {
    if (quizStarted && currentQuestionIndex < questions.length) {
      const q = questions[currentQuestionIndex];
      speak(q);
    }

    if (quizStarted && currentQuestionIndex === questions.length) {
      // All questions done – submit for scoring
      scoreResponses();
    }
  }, [currentQuestionIndex, quizStarted]);

  const scoreResponses = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/score', {
        questions: questions,
        answers: responses
      });
      
      // Calculate average score
      const scores = response.data.results.map(r => r.analysis.score);
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;
      setAverageScore(average);
      
      // Store score in localStorage
      const existingScores = JSON.parse(localStorage.getItem('quizScores')) || [];
      const newScore = {
        name: localStorage.getItem('userName') || 'Anonymous User',
        average: average,
        date: new Date().toISOString()
      };
      localStorage.setItem('quizScores', JSON.stringify([...existingScores, newScore]));
      
      setResults(response.data.results);
      setShowResults(true);

      if (average < 5) {
        setShowReattemptDialog(true);
      }
    } catch (error) {
      console.error('Error scoring quiz:', error);
      alert('Failed to score quiz responses');
    }
  };

  const handleReattempt = () => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setResponses([]);
    setResults([]);
    setShowResults(false);
    setShowReattemptDialog(false);
    setLiveTranscript('');
  };

  const renderResults = () => (
    <div className="results-container p-4 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Quiz Results 🎯</h2>
      <div className="text-center mb-4">
        <p className="text-xl font-bold">Average Score: {averageScore.toFixed(1)}/10</p>
      </div>
      {results.map((result, i) => (
        <div key={i} className="mb-6 border p-4 rounded-lg bg-white shadow-sm">
          <h3 className="text-lg font-semibold text-blue-700">Question {i + 1}</h3>
          <p className="my-2">{result.question}</p>
          <div className="bg-gray-50 p-3 rounded my-2">
            <p className="font-medium">Your Answer:</p>
            <p className="text-gray-700">{result.userAnswer}</p>
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-green-600">
              Score: {result.analysis.score}/10
            </p>
            <p className="text-gray-600 mt-2">
              <span className="font-medium">Feedback:</span> {result.analysis.feedback}
            </p>
            <p className="text-gray-600 mt-2">
              <span className="font-medium">Ideal Answer:</span> {result.analysis.correctAnswer}
            </p>
          </div>
        </div>
      ))}

      {/* Add reattempt dialog */}
      {showReattemptDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Your average score is below 5</h3>
            <p className="mb-4">Would you like to attempt the quiz again?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowReattemptDialog(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Try Later
              </button>
              <button
                onClick={handleReattempt}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reattempt Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderQuizSection = () => {
    if (currentQuestionIndex >= questions.length) {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-2">Quiz Completed 🎉</h2>
          {showResults ? renderResults() : <p>Analyzing your answers...</p>}
        </div>
      );
    }

    return (
      <div>
        <h2 className="text-lg font-bold mb-2">Question {currentQuestionIndex + 1}</h2>
        <p className="mb-2">{questions[currentQuestionIndex]}</p>
        {isSpeaking ? (
          <p className="text-sm text-gray-500 italic mb-1">Please wait while the question is being read...</p>
        ) : (
          <div>
            <p className="text-sm text-gray-500 italic mb-1">
              {isListening ? `Time remaining: ${timeLeft}s` : 'Please speak your answer...'}
            </p>
            {isListening && (
              <button
                onClick={() => handleNextQuestion()}
                className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
              >
                Next Question →
              </button>
            )}
          </div>
        )}
        {liveTranscript && (
          <div className="border p-2 text-gray-800 bg-gray-100 rounded mb-2">
            <p className="text-sm">🗣️ <strong>Live:</strong> {liveTranscript}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">GitHub & Resume Quiz</h1>

      {!quizStarted ? (
        <>
          <input
            className="border p-2 w-full mb-3"
            placeholder="Enter GitHub Repo or Profile URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <input
            type="file"
            accept=".pdf"
            className="border p-2 w-full mb-3"
            onChange={handleFileChange}
          />

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Generating Questions...' : 'Start Quiz'}
          </button>
        </>
      ) : (
        <div>{renderQuizSection()}</div>
      )}
    </div>
  );
}

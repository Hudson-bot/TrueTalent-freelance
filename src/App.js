import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CommunityPage from "./components/CommunityPage";
import HomePage from "./components/HomePage";
import AboutPage from "./components/AboutPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/community" element={<CommunityPage />} />
      </Routes>
    </Router>
  );
};

export default App;
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HeroComponent from "./components/Home/HeroComponent";
import HomePage from "./components/HomePage";

// Main App Component
function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage/>} />
        </Routes>
      </div>
    </Router>
  );
}

// // Home Page Component
// function HomePage() {
//   return (
//     <div>
//       <HomePage />
//     </div>
//   );
// }

export default App;

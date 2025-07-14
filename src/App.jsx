import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
// import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Scan from './pages/Scan'; // Assuming you have a Scan page

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/scan" element={<Scan />} />
      </Routes>
    </Router>
  );
};

export default App;

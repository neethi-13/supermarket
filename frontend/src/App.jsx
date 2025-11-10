import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomeTot from "./homecomponent/HomeTot";
import AdminTot from "./admincomponent/AdminTot";
import CusTot from "./cuscomponent/CusTot";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeTot />} />
        <Route path="/admin" element={<AdminTot />} />
        <Route path="/customer" element={<CusTot />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
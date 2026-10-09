import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
}

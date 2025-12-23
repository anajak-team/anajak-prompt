import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const rootElement = document.getElementById('root');

if (!rootElement) {
  // This is a critical failure, the app cannot start.
  throw new Error("Fatal Error: The root element with ID 'root' was not found in the DOM.");
}

// The browser's module loader guarantees that all dependencies are loaded before this script runs.
// If a dependency fails to load, the browser will throw a native error in the console.
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

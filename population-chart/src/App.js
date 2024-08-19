import React from 'react';
import PopulationChart from './PopulationChart';
import ErrorBoundary from './ErrorBoundary';
function App() {
  return (
    <div className="App">
      <h1>Population Growth Chart</h1>
      <ErrorBoundary>
        <PopulationChart />
      </ErrorBoundary>
    </div>
  );
}

export default App;

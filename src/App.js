import React from 'react';
import './App.css';

const styleArgument = { fontSize: '100px', color: 'red' }; // 設定樣式 [cite: 1654]

const changeText = (event) => {
  event.target.innerText = event.target.innerText + "被點了"; // 點擊變化 [cite: 1717]
};

function App() {
  return (
    <div className="App">
      <h1 style={styleArgument} onClick={changeText}>
        hello CGU!!
      </h1>
    </div>
  );
}

export default App;
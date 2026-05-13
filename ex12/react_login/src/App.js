import React from 'react';
import './App.css';
import CGU_Login from './cgu_login'; // 引入你的登入組件

function App() {
  return (
    <div className="App">
      {/* 呼叫剛才寫好的登入元件 */}
      <CGU_Login />
    </div>
  );
}

export default App;
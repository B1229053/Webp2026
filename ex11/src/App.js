import React from 'react';
import './App.css';
// 1. 引入圖示按鈕組件與文字組件
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// 2. 引入你想用的圖示 (例如：點擊手勢圖示)
import TouchAppIcon from '@mui/icons-material/TouchApp';

function App() {
  const [text, setText] = React.useState("hello CGU!!");

  const handleClick = () => {
    setText(text + "被點了");
  };

  return (
    <div className="App" style={{ marginTop: '100px', textAlign: 'center' }}>
      <Typography variant="h2" color="primary" gutterBottom>
        {text}
      </Typography>

      {/* 3. 使用 IconButton 取代原本的 Button */}
      {/* color="secondary" 會讓圖示變成紫色/粉紅色 */}
      <IconButton 
        color="secondary" 
        onClick={handleClick}
        aria-label="finger print"
        size="large"
        style={{ backgroundColor: '#f5f5f5', padding: '20px' }} // 加點背景讓它像個圓形按鈕
      >
        <TouchAppIcon sx={{ fontSize: 40 }} /> 
      </IconButton>
      
      <Typography variant="body1" style={{ marginTop: '10px' }}>
        點擊上方圖示
      </Typography>
    </div>
  );
}

export default App;
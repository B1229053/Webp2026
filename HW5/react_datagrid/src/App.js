import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import RefreshIcon from '@mui/icons-material/Refresh';

const API_URL =
  'https://cloud.culture.tw/frontsite/trans/SearchShowAction.do?method=doFindTypeJ&category=6';

const columns = [
  { field: 'title', headerName: '活動名稱', flex: 1.4, minWidth: 220 },
  { field: 'location', headerName: '地點', flex: 1, minWidth: 180 },
  { field: 'price', headerName: '票價', flex: 0.7, minWidth: 140 },
  { field: 'startDate', headerName: '開始日期', width: 130 },
  { field: 'endDate', headerName: '結束日期', width: 130 },
];

function toRows(dataset) {
  return dataset.map((item, index) => {
    const info = item.showInfo?.[0] || {};

    return {
      id: `${item.UID || item.title}-${index}`,
      title: item.title || '未提供',
      location: info.location || '未提供',
      price: info.price || '未提供',
      startDate: info.time?.slice(0, 10) || '未提供',
      endDate: info.endTime?.slice(0, 10) || '未提供',
    };
  });
}

function App() {
  const [rows, setRows] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadShows() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(API_URL, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`API 回傳狀態 ${response.status}`);
        }

        const dataset = await response.json();
        setRows(toRows(dataset));
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(`資料載入失敗：${err.message}`);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadShows();

    return () => controller.abort();
  }, [reloadKey]);

  const filteredRows = useMemo(() => {
    const value = keyword.trim().toLowerCase();

    if (!value) {
      return rows;
    }

    return rows.filter((row) =>
      [row.title, row.location, row.price, row.startDate, row.endDate]
        .join(' ')
        .toLowerCase()
        .includes(value)
    );
  }, [keyword, rows]);

  return (
    <div className="App">
      <main className="page">
        <Typography variant="h4" component="h1" fontWeight={700}>
          HW5 React DataGrid
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          使用 useEffect 呼叫展演 API，並用 MUI DataGrid 顯示 HW4 的表格資料。
        </Typography>

        <div className="toolbar">
          <TextField
            label="搜尋活動、地點或票價"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            size="small"
            fullWidth
          />
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => setReloadKey((current) => current + 1)}
          >
            重新整理
          </Button>
        </div>

        <Box className="data-grid-wrap">
          <DataGrid
            rows={filteredRows}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            pageSizeOptions={[10, 25, 50]}
          />
        </Box>

        <Typography className={error ? 'status error' : 'status'} variant="body2">
          {error || `目前顯示 ${filteredRows.length} 筆資料`}
        </Typography>
      </main>
    </div>
  );
}

export default App;

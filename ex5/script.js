var count = 1; // 宣告計數器 [cite: 1230]

// 新增按鈕的函式 [cite: 1231]
function addfunction() {
    // 建立一個 BUTTON 元素 [cite: 1232]
    var btn = document.createElement("BUTTON");
    
    // 設定按鈕內容與唯一 ID [cite: 1233, 1234]
    btn.innerHTML = `CLICK ME (${count})`;
    btn.setAttribute("id", "btn_" + count++);
    
    // 加入 Bootstrap 的紅色樣式 [cite: 1235]
    btn.setAttribute("class", "btn btn-outline-danger me-2 mt-2");
    
    // 將按鈕加入到網頁 body 中 [cite: 1237]
    document.body.appendChild(btn);
    console.log(btn);
}

// 刪除按鈕的函式 [cite: 1246]
function delfunction() {
    // 根據目前的 count 找出最後一個生成的按鈕 ID [cite: 1250]
    var btn = document.getElementById("btn_" + (--count));
    
    if (btn) {
        // 從 body 中移除該元素 [cite: 1254]
        document.body.removeChild(btn);
        console.log("Deleted:", btn);
    } else {
        // 防止 count 變成負數
        count = 1;
        alert("已經沒有按鈕可以刪除囉！");
    }
}

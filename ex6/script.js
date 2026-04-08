// 取得容器元素 [cite: 1611]
const container = document.getElementById('container');

// 輔助函式：產生指定長度的 a-z 亂數字串
function generateRandomAlphabet(min, max) {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    let result = "";
    const length = Math.floor(Math.random() * (max - min + 1)) + min;
    for (let i = 0; i < length; i++) {
        result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return result;
}

// 2. 網頁載入時 (window.onload)：亂數產生 0-2 個字元 [cite: 1644]
window.onload = function() {
    container.textContent = generateRandomAlphabet(0, 2);
    container.focus(); // 自動聚焦方便直接輸入
};

// 鍵盤事件監聽 [cite: 1612, 1668]
window.addEventListener("keyup", function(e) {
    console.log("Pressed:", e.key); // 偵錯用 [cite: 1613]
    
    let currentStr = container.textContent;

    // 3. 打入字元和第一個字相等時，消除該字元 [cite: 1644, 1671-1677]
    if (currentStr.length > 0 && e.key === currentStr[0]) {
        container.textContent = currentStr.substring(1);
    }

    // 4. 在 keyup event 時，亂數產生 1-3 個字元接在字串後 [cite: 1651, 1681-1684]
    add_new_chars();
});

// 封裝新增字元的函式 [cite: 1683]
function add_new_chars() {
    const newChars = generateRandomAlphabet(1, 3);
    container.textContent += newChars;
}

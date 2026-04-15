var container = document.getElementById('container');
var counter = 0; // 連續錯誤計數器 [cite: 214]

// 產生亂數字串的函式 [cite: 194-213]
function add_new_chars(x, isRandom = true) {
    let n = isRandom ? (Math.floor(Math.random() * x) + 1) : x;
    let str = "";
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    for (let i = 0; i < n; i++) {
        str += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return str;
}

// 初始化網頁 [cite: 189-191]
window.onload = function() {
    container.textContent = add_new_chars(3);
    container.focus();
};

// 按下按鍵時：比對字元並給予顏色回饋 [cite: 253, 256]
window.addEventListener("keydown", function(e) {
    var currentStr = container.textContent;
    if (currentStr.length === 0) return;

    var firstone = currentStr.substring(0, 1);
    var colorStyle = "";

    // 判斷對錯來決定顏色 (打對綠色，打錯紅色)
    if (e.key === firstone) {
        colorStyle = "color: green; font-size: 3.5cm; font-weight: bold;";
    } else {
        colorStyle = "color: red; font-size: 3.5cm; font-weight: bold;";
    }
    
    // 建立帶樣式的標籤並更新 HTML 
    var tmp = "<span style='" + colorStyle + "'>" + firstone + "</span>";
    container.innerHTML = tmp + currentStr.substring(1);
});

// 放開按鍵時：處理消除字元與錯誤懲罰邏輯 [cite: 215-234]
window.addEventListener("keyup", function(e) {
    var currentStr = container.textContent;
    var firstone = currentStr.substring(0, 1);

    if (e.key === firstone) {
        // 打對了：消除字元並補新字 [cite: 220, 237]
        container.textContent = currentStr.substring(1) + add_new_chars(3);
        counter = 0; // 歸零錯誤計數
    } else {
        // 打錯了：附加打錯的字並累積錯誤 [cite: 221-222]
        container.textContent = currentStr + e.key;
        if (counter++ >= 2) {
            // 連續打錯三次的處罰 [cite: 167-168, 235]
            container.textContent += add_new_chars(6, false);
            counter = 0;
            console.log("連續錯誤處罰！");
        }
    }
});

// 使用老師提供的 API Key [cite: 2064]
const apiKey = 'ca370d51a054836007519a00ff4ce59e';

function getFlickrImg() {
    const gal = document.getElementById("gallery");
    gal.innerHTML = ""; // 清空舊內容

    // 1. 抓取最近的照片清單 [cite: 2064]
    const listUrl = `https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=${apiKey}&per_page=10&format=json&nojsoncallback=1`;

    fetch(listUrl)
        .then(res => res.json())
        .then(data => {
            const photos = data.photos.photo;

            // 2. 針對每張照片 ID，抓取可用的圖片尺寸網址 [cite: 2072]
            photos.forEach(photo => {
                const sizeUrl = `https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=${apiKey}&photo_id=${photo.id}&format=json&nojsoncallback=1`;

                fetch(sizeUrl)
                    .then(res => res.json())
                    .then(sizeData => {
                        // 取得尺寸列表中的其中一個網址 (例如 index 4 的 Medium 尺寸)
                        const imgSource = sizeData.sizes.size[4].source;

                        // 3. 建立圖片元素並加入容器 [cite: 1423-1426]
                        const img = document.createElement("img");
                        img.src = imgSource;
                        gal.appendChild(img);
                    });
            });
        })
        .catch(err => console.error("API 抓取失敗:", err));
}

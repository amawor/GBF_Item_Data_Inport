// 定義 copyHTML 方法，當點擊圖示時觸發
function copyHTML(tab) {
  chrome.scripting.executeScript({
      target: {tabId: tab.id},
      function: () => {
          return document.documentElement.outerHTML;
      }
  }, function(result) {
      var htmlCode = result[0].result;
      navigator.clipboard.writeText(htmlCode).then(function() {
          console.log('HTML code copied to clipboard');
      }, function() {
          console.error('Failed to copy HTML code to clipboard');
      });
  });
}

// 定義 uploadHTML 方法，當從 popup.js 收到上傳 HTML 內容的消息時觸發
function uploadHTML(htmlCode) {
  // 在這裡執行上傳 HTML 內容到伺服器的相關操作
  console.log('Received HTML to upload:', htmlCode);
  // 這裡可以添加上傳 HTML 內容的程式碼
}

// 監聽圖示點擊事件
chrome.action.onClicked.addListener((tab) => {
  copyHTML(tab);
});

// 監聽消息，以便在需要時觸發 copyHTML 方法或 uploadHTML 方法
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'copyHTML') {
      copyHTML(sender.tab);
  } else if (message.action === 'uploadHTML') {
      uploadHTML(message.htmlCode);
  }
});

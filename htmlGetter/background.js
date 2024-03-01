// background.js
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      function: copyHTML
    });
  });
  
  function copyHTML() {
    chrome.scripting.executeScript({
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
  
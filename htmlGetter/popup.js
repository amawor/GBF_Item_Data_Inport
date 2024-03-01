// popup.js
document.addEventListener('DOMContentLoaded', function() {
    var copyButton = document.getElementById('copyButton');
    copyButton.addEventListener('click', function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'copyHTML'}, function(response) {
          if (!response || !response.result) {
            console.error('Failed to get HTML code');
            return;
          }
          var htmlCode = response.result;
          navigator.clipboard.writeText(htmlCode).then(function() {
            console.log('HTML code copied to clipboard');
          }, function() {
            console.error('Failed to copy HTML code to clipboard');
          });
        });
      });
    });
  });
  
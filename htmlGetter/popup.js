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
        
        // POST HTML to Flask API
        fetch('http://localhost:5000/api/uploadHTML', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/html'
          },
          body: htmlCode
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to upload HTML to server');
          }
          console.log('HTML uploaded successfully');
        })
        .catch(error => {
          console.error('Error:', error);
        });
      });
    });
  });
});

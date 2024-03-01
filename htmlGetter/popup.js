// popup.js

document.addEventListener('DOMContentLoaded', function() {
  var copyButton = document.getElementById('copyButton');
  var uploadButton = document.getElementById('uploadButton');
  
  copyButton.addEventListener('click', function() {
      copyHTML();
  });

  uploadButton.addEventListener('click', function() {
      navigator.clipboard.readText().then(function(htmlCode) {
          uploadHTML(htmlCode);
      }, function() {
          console.error('Failed to read HTML from clipboard');
      });
  });
});

function copyHTML() {
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
}

function uploadHTML(htmlCode) {
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
  // POST HTML to Flask API
  fetch('http://127.0.0.1:5000/api/uploadHTML', {
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
      return response.text();
  })
  .then(data => {
      console.log('Server response:', data);
  })
  .catch(error => {
      console.error('Error:', error);
  });
}

// content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'copyHTML' || request.action === 'uploadHTML') {
      sendResponse({result: document.documentElement.outerHTML});
  }
});

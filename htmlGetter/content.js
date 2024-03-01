// content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'copyHTML') {
      sendResponse({result: document.documentElement.outerHTML});
    }
});

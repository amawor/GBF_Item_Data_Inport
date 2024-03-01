document.addEventListener('DOMContentLoaded', function() {
    var copyAndSendButton = document.getElementById('copyAndSendButton');
    copyAndSendButton.addEventListener('click', function() {
        chrome.action.setBadgeText({text: 'Copying...'});
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                function: () => {
                    return document.documentElement.outerHTML;
                }
            }, function(result) {
                if (!result || !result[0] || !result[0].result) {
                    console.error('Failed to get HTML code');
                    chrome.action.setBadgeText({text: 'Error!'});
                    return;
                }
                var htmlCode = result[0].result;
                navigator.clipboard.writeText(htmlCode).then(function() {
                    console.log('HTML code copied to clipboard');
                    chrome.action.setBadgeText({text: 'Copied!'});
                }, function() {
                    console.error('Failed to copy HTML code to clipboard');
                    chrome.action.setBadgeText({text: 'Error!'});
                });
            });
        });
    });
});

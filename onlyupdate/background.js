chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: () => {
            return document.documentElement.outerHTML;
        }
    }, function(result) {
        var htmlCode = result[0].result;
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
    });
});

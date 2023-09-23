document.getElementById('startProcess').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: 'startUpdatingStatus'}, function(response) {
      window.close(); // Close popup after sending the message
    });
  });
  
let submissions = [];
let currentIndex = 0;
console.log(currentIndex)

function getSubmissionStatus() {
    fetch('http://127.0.0.1:5000/get_submission_status', {method: 'POST'})
        .then(response => response.json())
        .then(data => {
            submissions = data.submissions;
            processSubmission();
        });
}

function processSubmission() {
    console.log(currentIndex,submissions.length)
    if (currentIndex < submissions.length) {
        let submission = submissions[currentIndex];
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            let activeTab = tabs[0];
            chrome.scripting.executeScript({
                target: {tabId: activeTab.id},
                func: manipulatePage,  
                args: [submission,currentIndex]
            }, () => {
                // After execution, check if it's done, then proceed
                setTimeout(() => {
                    chrome.runtime.onMessage.addListener(function listener(message) {
                      if (message.done) {
                        if(true){
                          submissions[message.result-1][1]=message.status
                        fetch('http://127.0.0.1:5000/update_submission_status',{
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ result: submissions[message.result-1] }),
                        }).then(response => response.json())
                        .then(data => {
                            // Handle the response from the Flask server, if needed
                        })
                        .catch(error => {
                            console.error('Error sending request to Flask server:', error);
                        });}
                          currentIndex=message.result
                          chrome.runtime.onMessage.removeListener(listener);
                      }
                  });
              
                    processSubmission();
                }, 3000);  
            });
        });
    } else {
        console.log('All submissions processed.');
    }
}

// The function to be injected and run on the whole page
function manipulatePage(submission,currentIndex) {
        console.log("Message received in content.js");
        if (window.location.href === "https://www.psacard.com/myaccount/myorders") {
            console.log("Page is fully loaded");

            const enterKeyEvent = new KeyboardEvent('keydown', {
                'key': 'Enter',
                'code': 'Enter',
                'keyCode': 13,
                'which': 13,
                'bubbles': true,
                'cancelable': true
            });
            document.getElementById('search').value = submission[0];
            document.getElementById('search').click();
            document.getElementById('search').dispatchEvent(enterKeyEvent);
            console.log("Search submitted. Waiting for next page...");

            // Wait for next page
            let checkInterval = setInterval(function() {
                console.log(window.onload)
                console.log(document.getElementsByClassName("hidden lg:block").length)
                // Add a condition to check if the next page has loaded.
                // For instance, if you expect an element with a certain ID to be present on the next page:
                if (window.location.href !== "https://www.psacard.com/myaccount/myorders" && document.getElementsByClassName("hidden lg:block").length>=19 && document.readyState==='complete') {
                    clearInterval(checkInterval);
                    updateStatus(submission[0],currentIndex);

                }
                else if(window.location.href==="https://www.psacard.com/myaccount/myorders" && document.getElementById("search")){
                }
            }, 100); // Check every second
        }

function updateStatus(data,currentIndex) {
    console.log("Updating status...");
    let new_status = "";
    let element = document.getElementsByTagName("ul")[9].getElementsByClassName("text-primary-500");
    console.log(element.length)
    if (element.length < 1) {
        let element2 = document.getElementsByTagName("ul")[9].getElementsByClassName("text-neutral2");
        new_status = element2[element2.length - 1].innerText;
    } else {
        console.log(element[element.length - 1].innerTex)
        new_status = element[element.length - 1].innerText;
    }
    document.getElementsByTagName("nav")[1].getElementsByTagName("li")[1].getElementsByTagName("a")[0].click()
    data[1]=new_status

    currentIndex=currentIndex+1
    chrome.runtime.sendMessage({ done: true, result: currentIndex,status:new_status });


}
}

getSubmissionStatus();



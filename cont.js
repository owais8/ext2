if (window.location.href === "https://www.psacard.com/myaccount/myorders") { // Replace with your specific URL
window.addEventListener("load", function() {
    const enterKeyEvent = new KeyboardEvent('keydown', {
        'key': 'Enter',
        'code': 'Enter',
        'keyCode': 13,
        'which': 13,
        'bubbles': true,
        'cancelable': true
    });        
    document.getElementById('search').value="${submission.submission}"
    document.getElementById('search').click();
    document.getElementById('search').dispatchEvent(enterKeyEvent);

    console.log("Page fully loaded.");
});
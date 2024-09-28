document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('prompt').addEventListener('input', updateContent);

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var activeTab = tabs[0];

        chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: getSelectedContent,
        }, function(result) {
            if (result && result[0] && result[0].result) {
                var selectedContent = result[0].result;
                displaySelectedContent(selectedContent);
                updateContent(); // Call updateContent function after getting selected content
            }
        });
    });

    document.getElementById('sendToGemini').addEventListener('click', updateContentAndSendToGemini);
});

function displaySelectedContent(selectedContent) {
    var contentElement = document.getElementById('content');
    if (selectedContent !== "") {
        contentElement.textContent = selectedContent;
    } else {
        contentElement.textContent = "No content selected.";
    }
}

function updateContent() {
    var promptValue = document.getElementById('prompt').value;
    var selectedContent = document.getElementById('content').textContent;
    var displayElement = document.getElementById('display');

    if (selectedContent.trim() !== "") {
        displayElement.textContent = promptValue + ": " + selectedContent;
    } else {
        displayElement.textContent = "No content selected.";
    }
}

function getSelectedContent() {
    var selectedText = window.getSelection().toString();
    return selectedText;
}

async function sendToGemini(inputText) {
    const responseContainer = document.getElementById("responseContainer");

    try {
        const response = await fetch('http://localhost:3000/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ inputText }),
        });

        const responseData = await response.text();
        console.log(responseData);
        responseContainer.innerText = responseData;
    } catch (error) {
        console.error('Error sending to Gemini:', error);
        responseContainer.innerText = 'Error sending to Gemini';
    }
}

function updateContentAndSendToGemini() {
    var promptValue = document.getElementById('prompt').value;
    var selectedContent = document.getElementById('content').textContent;

    if (selectedContent.trim() !== "") {
        var contentToSend = promptValue + ": " + selectedContent;
        document.getElementById('display').textContent = contentToSend;
        sendToGemini(contentToSend);
    } else {
        console.error("Error: No content to send to Gemini");
    }
}

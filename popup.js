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

    if (prompt!="" || selectedContent.trim() !== "") {
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
        var contentToSend = promptValue + ": " + (selectedContent === "No content selected." ? "" : selectedContent);

        // Update the display element with truncation and toggling
        setContent(contentToSend);

        // Call the function to send the content to Gemini
        sendToGemini(contentToSend);

        // Ensure the input container scrolls into view
        document.getElementById('inputContainer').scrollIntoView({ behavior: 'smooth' });
    } else {
        console.error("Error: No content to send to Gemini");
    }
}

// Function to limit content to two sentences
function truncateContent(content) {
    const sentences = content.split('. '); // Split content into sentences
    if (sentences.length <= 1) {
        return { truncated: content, isTruncated: false };
    }
    return {
        truncated: sentences.slice(0, 1).join('. ') + '...', // Take first two sentences
        isTruncated: true,
    };
}

// Function to set content in the #display element and toggle on click
function setContent(content) {
    const displayElement = document.getElementById('display');
    const { truncated, isTruncated } = truncateContent(content);

    // Set initial content and store full content for toggling
    displayElement.textContent = truncated;

    console.log(truncated);
    displayElement.dataset.fullContent = content;
    displayElement.dataset.truncatedContent = truncated;
    displayElement.dataset.isTruncated = isTruncated;

    // Attach click event listener for toggling content
    displayElement.onclick = function () {
        if (displayElement.dataset.isTruncated === "true") {
            const isExpanded = displayElement.dataset.expanded === "true";
            displayElement.textContent = isExpanded ? truncated : content; // Toggle text
            displayElement.dataset.expanded = isExpanded ? "false" : "true"; // Update state
        }
    };
}

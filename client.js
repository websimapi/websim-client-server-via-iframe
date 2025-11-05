const sendButton = document.getElementById('send-button');
const cityInput = document.getElementById('city-input');
const responseLog = document.getElementById('response-log');
const serverIframe = document.getElementById('server-iframe');

const serverOrigin = 'https://weather-api--api.on.websim.com';

// Disable the button until the iframe is loaded and ready
sendButton.disabled = true;
responseLog.textContent = 'Server iframe is loading...';

// Function to send a message to the iframe
function sendMessageToServer(command, payload) {
    if (serverIframe.contentWindow) {
        const message = { command, payload };
        serverIframe.contentWindow.postMessage(message, serverOrigin);
        responseLog.textContent = `Requesting weather for "${payload}"...`;
        console.log('Message sent to server:', message);
    } else {
        console.error('Server iframe contentWindow is not available.');
        responseLog.textContent = 'Error: Could not communicate with the server.';
    }
}

// Listen for the button click
sendButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (!city) {
        alert('Please enter a city name.');
        return;
    }
    sendMessageToServer('getWeather', city);
});

// Allow sending via Enter key in the input field
cityInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        sendButton.click();
    }
});

// Listen for messages from the server iframe
window.addEventListener('message', (event) => {
    // Security: always check the origin of the message
    if (event.origin !== serverOrigin) {
        console.warn(`Message received from unexpected origin: ${event.origin}`);
        return;
    }

    console.log('Message received from server:', event.data);

    // Handle the 'ready' signal from the iframe
    if (event.data && event.data.status === 'ready') {
        sendButton.disabled = false;
        responseLog.textContent = 'Server is ready. Enter a city and click "Get Weather".';
        console.log('Server is ready to receive commands.');
        // Optionally send a request for a default city on load
        sendMessageToServer('getWeather', cityInput.value || 'London');
        return;
    }

    // Display the received data
    const formattedResponse = JSON.stringify(event.data, null, 2);
    responseLog.textContent = formattedResponse;
});
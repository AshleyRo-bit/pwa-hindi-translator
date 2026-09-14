
let isListening = false;

/* ---------------------------------------
   SPEECH RECOGNITION
--------------------------------------- */

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let activeInput = null;
let activeButton = null;
let finalTranscript = "";

function toggleSpeech() {
    startSpeech("hi-IN", "hindiText", "speakButton");
}

function toggleEnglishSpeech() {
    startSpeech("en-US", "englishInput", "englishSpeakButton");
}

function startSpeech(language, inputId, buttonId) {
    if (!SpeechRecognition) {
        setStatus(
            "Speech recognition is not supported. Use Chrome or Edge."
        );
        return;
    }

    if (recognition) {
        recognition.stop();
        return;
    }

    activeInput = document.getElementById(inputId);
    activeButton = document.getElementById(buttonId);
    finalTranscript = activeInput.value.trim();

    recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        activeButton.textContent = "⏹ Stop listening";
        setStatus("Listening…", true);
    };

    recognition.onresult = event => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const text = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                finalTranscript += `${text} `;
            } else {
                interimTranscript += text;
            }
        }

        activeInput.value =
            `${finalTranscript}${interimTranscript}`.trim();

        activeInput.dispatchEvent(new Event("input", {
            bubbles: true
        }));
    };

    recognition.onerror = event => {
        console.error("Speech recognition error:", event.error);

        const message = {
            "not-allowed": "Microphone permission was denied.",
            "audio-capture": "No microphone was found.",
            "no-speech": "No speech was detected."
        }[event.error] || `Speech error: ${event.error}`;

        setStatus(message);
    };

    recognition.onend = () => {
        if (activeButton) {
            activeButton.textContent =
                activeButton.id === "speakButton"
                    ? "🎤 Speak Hindi"
                    : "🎤 Speak English";
        }

        recognition = null;
        activeInput = null;
        activeButton = null;
        setStatus("Ready");
    };

    recognition.start();
}


function stopSpeech() {

    if (recognition) {

        recognition.stop();
    }
}


/* ---------------------------------------
   ENGLISH TEXT TO SPEECH
--------------------------------------- */

function speakEnglish() {

    const text =
        document
            .getElementById("englishText")
            .textContent
            .trim();

    if (!text ||
        text === "Translation will appear here." ||
        text.startsWith("Translation service")) {

        return;
    }

    speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";

    speechSynthesis.speak(utterance);
}


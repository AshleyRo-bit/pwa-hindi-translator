const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;
let listeningInput = null;
let listeningButton = null;
let listeningLabel = "";
let finalTranscript = "";

function toggleSpeech() {
    toggleListening("hi-IN", "hindiText", "speakButton", "🎤 Speak Hindi");
}

function toggleEnglishSpeech() {
    toggleListening(
        "en-US",
        "englishInput",
        "englishSpeakButton",
        "🎤 Speak English"
    );
}

function toggleListening(language, inputId, buttonId, defaultLabel) {
    if (isListening && recognition) {
        recognition.stop();
        return;
    }

    if (!SpeechRecognition) {
        setStatus("Use Google Chrome or Microsoft Edge for speech input.");
        return;
    }

    if (!window.isSecureContext) {
        setStatus("Open this page using HTTPS or http://localhost.");
        return;
    }

    listeningInput = document.getElementById(inputId);
    listeningButton = document.getElementById(buttonId);
    listeningLabel = defaultLabel;
    finalTranscript = listeningInput.value.trim();

    recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        isListening = true;
        listeningButton.textContent = "⏹ Stop listening";
        listeningButton.classList.add("listening-button");
        setStatus("Listening… speak now.", true);
    };

    recognition.onresult = event => {
        let interimTranscript = "";

        for (
            let index = event.resultIndex;
            index < event.results.length;
            index++
        ) {
            const text = event.results[index][0].transcript;

            if (event.results[index].isFinal) {
                finalTranscript += `${text} `;
            } else {
                interimTranscript += text;
            }
        }

        listeningInput.value =
            `${finalTranscript}${interimTranscript}`.trim();
    };

    recognition.onerror = event => {
        const messages = {
            "not-allowed": "Microphone permission was denied.",
            "service-not-allowed": "Speech recognition is blocked.",
            "audio-capture": "No microphone was found.",
            "no-speech": "No speech was detected.",
            network: "Speech recognition requires an internet connection."
        };

        setStatus(messages[event.error] || `Speech error: ${event.error}`);
        console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
        isListening = false;

        if (listeningButton) {
            listeningButton.textContent = listeningLabel;
            listeningButton.classList.remove("listening-button");
        }

        recognition = null;
        listeningInput = null;
        listeningButton = null;

        setStatus("Ready");
    };

    try {
        recognition.start();
    } catch (error) {
        console.error(error);
        setStatus("Speech recognition could not start.");
        recognition = null;
    }
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


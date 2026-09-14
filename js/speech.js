let isListening = false;

/* ---------------------------------------
   SPEECH RECOGNITION
--------------------------------------- */

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let listeningButton = null;
let listeningInput = null;
let listeningLabel = "";

function toggleSpeech() {
    toggleListening(
        "hi-IN",
        "hindiText",
        "speakButton",
        "🎤 Speak Hindi"
    );
}

function toggleEnglishSpeech() {
    toggleListening(
        "en-US",
        "englishInput",
        "englishSpeakButton",
        "🎤 Speak English"
    );
}

async function toggleListening(
    language,
    inputId,
    buttonId,
    defaultLabel
) {
    if (recognition) {
        recognition.stop();
        return;
    }

    if (!SpeechRecognition) {
        setStatus(
            "Speech input is unsupported. Use Chrome or Edge."
        );
        return;
    }

    if (!window.isSecureContext) {
        setStatus("Microphone access requires HTTPS or localhost.");
        return;
    }

    try {
        const microphone =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

        // Permission has been granted. SpeechRecognition controls the mic.
        microphone.getTracks().forEach(track => track.stop());

        listeningInput = document.getElementById(inputId);
        listeningButton = document.getElementById(buttonId);
        listeningLabel = defaultLabel;

        recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            listeningButton.textContent = "⏹ Stop listening";
            listeningButton.classList.add("listening-button");
            setStatus("Listening… speak now, then press Stop.", true);
        };

        recognition.onresult = event => {
            let transcript = "";

            for (
                let index = event.resultIndex;
                index < event.results.length;
                index++
            ) {
                transcript += event.results[index][0].transcript;
            }

            if (transcript.trim()) {
                listeningInput.value = transcript.trim();
                listeningInput.dispatchEvent(
                    new Event("input", { bubbles: true })
                );
            }
        };

        recognition.onerror = event => {
            const errors = {
                "not-allowed": "Microphone permission was denied.",
                "audio-capture": "No microphone was found.",
                "no-speech": "No speech was detected.",
                network: "Speech recognition requires internet access."
            };

            setStatus(
                errors[event.error] ||
                `Speech recognition error: ${event.error}`
            );
        };

        recognition.onend = () => {
            if (listeningButton) {
                listeningButton.textContent = listeningLabel;
                listeningButton.classList.remove("listening-button");
            }

            recognition = null;
            listeningButton = null;
            listeningInput = null;
            setStatus("Ready");
        };

        recognition.start();
    } catch (error) {
        console.error("Microphone error:", error);

        setStatus(
            error.name === "NotAllowedError"
                ? "Microphone permission was denied."
                : "Microphone could not be accessed."
        );

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


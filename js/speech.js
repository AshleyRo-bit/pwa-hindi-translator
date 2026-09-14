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

async function toggleListening(language, inputId, buttonId, defaultLabel) {
    if (recognition) {
        recognition.stop();
        return;
    }

    if (!SpeechRecognition) {
        setStatus("Speech recognition is not supported. Try Chrome or Edge.");
        return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("Microphone access requires HTTPS or localhost.");
        return;
    }

    try {
        // Request microphone permission explicitly.
        const microphone = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        // SpeechRecognition manages the microphone itself.
        microphone.getTracks().forEach(track => track.stop());

        activeInput = document.getElementById(inputId);
        activeButton = document.getElementById(buttonId);
        finalTranscript = activeInput.value.trim();

        recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            activeButton.textContent = "⏹ Stop listening";
            setStatus("Listening…", true);
        };

        recognition.onresult = event => {
            let interimTranscript = "";

            for (
                let index = event.resultIndex;
                index < event.results.length;
                index++
            ) {
                const transcript = event.results[index][0].transcript;

                if (event.results[index].isFinal) {
                    finalTranscript += `${transcript} `;
                } else {
                    interimTranscript += transcript;
                }
            }

            activeInput.value =
                `${finalTranscript}${interimTranscript}`.trim();
        };

        recognition.onerror = event => {
            const messages = {
                "not-allowed": "Microphone permission was denied.",
                "service-not-allowed": "Speech recognition is not allowed.",
                "audio-capture": "No microphone was found.",
                "no-speech": "No speech was detected.",
                network: "Speech recognition needs an internet connection."
            };

            setStatus(
                messages[event.error] || `Speech error: ${event.error}`
            );
        };

        recognition.onend = () => {
            if (activeButton) {
                activeButton.textContent = defaultLabel;
            }

            recognition = null;
            activeInput = null;
            activeButton = null;
        };

        recognition.start();
    } catch (error) {
        console.error("Microphone error:", error);

        if (error.name === "NotAllowedError") {
            setStatus("Microphone permission was denied.");
        } else {
            setStatus("Microphone is unavailable.");
        }

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


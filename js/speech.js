const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;
let microphoneStream = null;
let listeningInput = null;
let listeningButton = null;
let listeningLabel = "";
let finalTranscript = "";

function testMicrophone() {
    if (!window.isSecureContext) {
        setStatus("Microphone requires an HTTPS page or localhost.");
        return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("This browser does not support microphone access.");
        return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            stream.getTracks().forEach(track => track.stop());
            setStatus("Microphone permission granted.");
        })
        .catch(error => {
            console.error("Microphone permission error:", error);

            if (error.name === "NotAllowedError") {
                setStatus("Microphone permission was denied.");
            } else {
                setStatus("The microphone could not be accessed.");
            }
        });
}

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

    if (!window.isSecureContext) {
        setStatus("Microphone requires HTTPS or localhost.");
        return;
    }

    if (!SpeechRecognition) {
        setStatus(
            "Speech-to-text is not supported in Chrome on this iPhone. " +
            "Try Safari or use typed input."
        );
        return;
    }

    try {
        microphoneStream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

        microphoneStream
            .getTracks()
            .forEach(track => track.stop());

        listeningInput = document.getElementById(inputId);
        listeningButton = document.getElementById(buttonId);
        listeningLabel = defaultLabel;
        finalTranscript = listeningInput.value.trim();

        recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            listeningButton.textContent = "⏹ Stop listening";
            listeningButton.classList.add("listening-button");
            setStatus("Listening… speak now.", true);
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
                listeningInput.value =
                    `${finalTranscript} ${transcript}`.trim();
            }
        };

        recognition.onerror = event => {
            console.error("Speech recognition error:", event.error);

            const messages = {
                "not-allowed": "Microphone permission was denied.",
                "service-not-allowed":
                    "Speech recognition is blocked by the browser.",
                "audio-capture": "No microphone was found.",
                "no-speech": "No speech was detected.",
                network:
                    "Speech recognition requires an internet connection."
            };

            setStatus(
                messages[event.error] ||
                `Speech recognition error: ${event.error}`
            );
        };

        recognition.onend = resetSpeechState;
        recognition.start();
    } catch (error) {
        console.error("Microphone error:", error);
        setStatus("The microphone could not be started.");
        resetSpeechState();
    }
}

function resetSpeechState() {
    if (listeningButton) {
        listeningButton.textContent = listeningLabel;
        listeningButton.classList.remove("listening-button");
    }

    recognition = null;
    listeningInput = null;
    listeningButton = null;
    microphoneStream = null;
}

function speakEnglish() {
    const input = document.getElementById("englishInput");
    const text = input?.value.trim();

    if (!text || !window.speechSynthesis) {
        return;
    }

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
}


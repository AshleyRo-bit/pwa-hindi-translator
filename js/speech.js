const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let recorder = null;
let microphoneStream = null;
let audioChunks = [];
let listeningInput = null;
let listeningButton = null;
let listeningLabel = "";

function toggleSpeech() {
    startSpeech("hi-IN", "hindiText", "speakButton", "🎤 Speak Hindi");
}

function toggleEnglishSpeech() {
    startSpeech(
        "en-US",
        "englishInput",
        "englishSpeakButton",
        "🎤 Speak English"
    );
}

async function startSpeech(language, inputId, buttonId, defaultLabel) {
    if (recognition || recorder) {
        stopSpeech();
        return;
    }

    if (!window.isSecureContext) {
        setStatus("Microphone access requires HTTPS or localhost.");
        return;
    }

    listeningInput = document.getElementById(inputId);
    listeningButton = document.getElementById(buttonId);
    listeningLabel = defaultLabel;

    try {
        microphoneStream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        // Use native recognition where supported.
        if (SpeechRecognition) {
            startBrowserRecognition(language);
            return;
        }

        // Fallback for iPhone Chrome/Safari.
        startRecording(language);
    } catch (error) {
        console.error(error);
        setStatus("Microphone permission was denied or unavailable.");
        resetSpeech();
    }
}

function startBrowserRecognition(language) {
    recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        setListeningState("⏹ Stop listening");
        setStatus("Listening… speak now.", true);
    };

    recognition.onresult = event => {
        let text = "";

        for (
            let index = event.resultIndex;
            index < event.results.length;
            index++
        ) {
            text += event.results[index][0].transcript;
        }

        if (text.trim()) {
            listeningInput.value = text.trim();
        }
    };

    recognition.onerror = event => {
        console.error("Speech recognition error:", event.error);
        setStatus(`Speech recognition error: ${event.error}`);
    };

    recognition.onend = resetSpeech;
    recognition.start();
}

function startRecording(language) {
    const mimeType = MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "audio/webm";

    recorder = new MediaRecorder(
        microphoneStream,
        { mimeType }
    );

    audioChunks = [];

    recorder.ondataavailable = event => {
        if (event.data.size > 0) {
            audioChunks.push(event.data);
        }
    };

    recorder.onstop = () => {
        const audio = new Blob(audioChunks, { type: mimeType });
        transcribeAudio(audio, language);
    };

    recorder.start();
    setListeningState("⏹ Stop recording");
    setStatus("Recording… speak now, then tap Stop.", true);
}

async function transcribeAudio(audio, language) {
    setStatus("Transcribing…");

    const formData = new FormData();
    formData.append("audio", audio, "speech audio");
    formData.append("language", language);

    try {
        const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Transcription request failed.");
        }

        const data = await response.json();
        listeningInput.value = data.text || "";
        setStatus("Transcription complete.");
    } catch (error) {
        console.error(error);
        setStatus(
            "Recording worked, but transcription service is unavailable."
        );
    } finally {
        resetSpeech();
    }
}

function stopSpeech() {
    if (recognition) {
        recognition.stop();
    }

    if (recorder && recorder.state !== "inactive") {
        recorder.stop();
    }

    microphoneStream?.getTracks().forEach(track => track.stop());
}

function setListeningState(label) {
    listeningButton.textContent = label;
    listeningButton.classList.add("listening-button");
}

function resetSpeech() {
    microphoneStream?.getTracks().forEach(track => track.stop());

    if (listeningButton) {
        listeningButton.textContent = listeningLabel;
        listeningButton.classList.remove("listening-button");
    }

    recognition = null;
    recorder = null;
    microphoneStream = null;
    audioChunks = [];
    listeningInput = null;
    listeningButton = null;
    setStatus("Ready");
}

<button id="captureButton"
        style="display:none"
        type="button"
        onclick="captureImage()">
    📸 Capture and read text
</button>

<script src="../js/clearText.js"></script>
<script src="../js/status.js"></script>
<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>
<script src="../js/camera.js"></script>
<script src="../js/speech.js"></script>


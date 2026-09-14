
let recognition = null;
let isListening = false;


/* ---------------------------------------
   SPEECH RECOGNITION
--------------------------------------- */

function createSpeechRecognizer() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        setStatus(
            "Speech recognition is not available in this browser."
        );

        return null;
    }

    const recognizer = new SpeechRecognition();

    // Hindi (India)
    recognizer.lang = "hi-IN";

    // Keep listening while possible
    recognizer.continuous = true;

    // Give us partial results
    recognizer.interimResults = true;

    recognizer.onstart = function () {

        isListening = true;

        const button =
            document.getElementById("speakButton");

        button.textContent = "⏹ Stop Listening";
        button.classList.add("danger");

        setStatus("🎤 Listening...", true);
    };

    recognizer.onresult = function(event) {

        let finalText = "";
        let interimText = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            const transcript =
                event.results[i][0].transcript;

            if (event.results[i].isFinal) {

                finalText += transcript;

            } else {

                interimText += transcript;
            }
        }

        const textarea =
            document.getElementById("hindiText");

        /*
         * For now we update the text box with
         * the recognized speech.
         */
        textarea.value =
            textarea.dataset.finalText || "";

        textarea.value += finalText;

        if (interimText) {

            textarea.value +=
                " " + interimText;
        }

        textarea.dataset.finalText =
            (textarea.dataset.finalText || "") +
            finalText;
    };

    recognizer.onerror = function(event) {

        console.error(
            "Speech recognition error:",
            event.error
        );

        setStatus(
            "Speech error: " + event.error
        );
    };

    recognizer.onend = function() {

        isListening = false;

        const button =
            document.getElementById("speakButton");

        button.textContent =
            "🎤 Speak Hindi";

        button.classList.remove("danger");

        setStatus("Speech stopped.");
    };

    return recognizer;
}


function toggleSpeech() {

    if (isListening) {

        stopSpeech();

    } else {

        startSpeech();
    }
}


function startSpeech() {

    if (!recognition) {

        recognition =
            createSpeechRecognizer();
    }

    if (!recognition) {
        return;
    }

    document
        .getElementById("hindiText")
        .dataset.finalText = "";

    try {

        recognition.start();

    } catch (error) {

        console.error(error);

        setStatus(
            "Could not start microphone."
        );
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


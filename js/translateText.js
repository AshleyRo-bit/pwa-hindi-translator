async function translateText() {

    const hindi =
        document
            .getElementById("hindiText")
            .value
            .trim();

    const output =
        document
            .getElementById("englishText");

    if (!hindi) {

        output.textContent =
            "Please enter or speak some Hindi.";

        return;
    }

    output.textContent =
        "Translation service will be connected next.";

    setStatus("Ready for translation backend.");
}


function startSpeech() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        document.getElementById("status").textContent =
            "Speech recognition is not supported by this browser.";

        return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "hi-IN";

    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.onstart = function () {

        document.getElementById("status").textContent =
            "🎤 Listening...";
    };

    recognition.onresult = function(event) {

        let transcript = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {
            transcript +=
                event.results[i][0].transcript;
        }

        document.getElementById("hindiText").value =
            transcript;
    };

    recognition.onerror = function(event) {

        document.getElementById("status").textContent =
            "Speech error: " + event.error;
    };

    recognition.onend = function() {

        document.getElementById("status").textContent =
            "Speech finished.";
    };

    recognition.start();
}


function speakEnglish() {

    const text =
        document.getElementById("englishText")
        .textContent;

    if (!text ||
        text === "Translation will appear here.") {
        return;
    }

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";

    speechSynthesis.speak(utterance);
}


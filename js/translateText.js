/* ---------------------------------------
   TRANSLATION
--------------------------------------- */

async function translate(source, target, text) {
    if (!text.trim()) {
        setStatus("Enter some text first.");
        return "";
    }

    setStatus("Translating…");

    const url =
        "https://api.mymemory.translated.net/get" +
        `?q=${encodeURIComponent(text)}` +
        `&langpair=${source}|${target}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Translation request failed.");
    }

    const data = await response.json();
    return data.responseData.translatedText;
}

async function translateHindiToEnglish() {
    try {
        const hindi = document.getElementById("hindiText").value;
        const english = await translate("hi", "en", hindi);

        document.getElementById("englishInput").value = english;
        document.getElementById("englishText").textContent = english;
        setStatus("Translated to English.");
    } catch (error) {
        console.error(error);
        setStatus("Translation failed. Check your internet connection.");
    }
}

async function translateEnglishToHindi() {
    try {
        const english = document.getElementById("englishInput").value;
        const hindi = await translate("en", "hi", english);

        document.getElementById("hindiText").value = hindi;
        setStatus("Translated to Hindi.");
    } catch (error) {
        console.error(error);
        setStatus("Translation failed. Check your internet connection.");
    }
}

/* Backward compatibility with the original Hindi translate button. */
function translateText() {
    return translateHindiToEnglish();
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


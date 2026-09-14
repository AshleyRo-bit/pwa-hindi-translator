/* ---------------------------------------
   TRANSLATION
--------------------------------------- */

async function translate(source, target, text) {
    if (!text.trim()) {
        throw new Error("Please enter text first.");
    }

    const url =
        "https://api.mymemory.translated.net/get" +
        `?q=${encodeURIComponent(text)}` +
        `&langpair=${source}|${target}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Translation request failed.");
    }

    const data = await response.json();
    const translation = data?.responseData?.translatedText;

    if (!translation) {
        throw new Error("No translation was returned.");
    }

    return translation;
}

async function requestTranslation(text, source, target) {
    const value = text.trim();

    if (!value) {
        throw new Error("Please enter text first.");
    }

    const url =
        "https://api.mymemory.translated.net/get" +
        `?q=${encodeURIComponent(value)}` +
        `&langpair=${source}|${target}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Translation service is unavailable.");
    }

    const data = await response.json();

    const translatedText =
        data?.responseData?.translatedText ||
        data?.matches?.[0]?.translation;

    if (!translatedText) {
        console.error("Unexpected translation response:", data);
        throw new Error("No translation was returned.");
    }

    return translatedText;
}

async function translateHindiToEnglish() {
    const hindiInput = document.getElementById("hindiText");
    const englishInput = document.getElementById("englishInput");

    try {
        setStatus("Translating Hindi to English…");

        const result = await requestTranslation(
            hindiInput.value,
            "hi",
            "en"
        );

        englishInput.value = result;
        englishInput.dispatchEvent(new Event("input", { bubbles: true }));

        setStatus("English translation ready.");
    } catch (error) {
        console.error(error);
        setStatus(error.message);
    }
}

async function translateEnglishToHindi() {
    const englishInput = document.getElementById("englishInput");
    const hindiInput = document.getElementById("hindiText");

    try {
        setStatus("Translating English to Hindi…");

        const result = await requestTranslation(
            englishInput.value,
            "en",
            "hi"
        );

        hindiInput.value = result;
        hindiInput.dispatchEvent(new Event("input", { bubbles: true }));

        setStatus("Hindi translation ready.");
    } catch (error) {
        console.error(error);
        setStatus(error.message);
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


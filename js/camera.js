/* ---------------------------------------
   CAMERA, OCR, AND TRANSLATION
--------------------------------------- */

let cameraStream = null;
let ocrWorker = null;
let ocrLanguage = null;

async function openCamera() {
    const video = document.getElementById("camera");
    const captureButton = document.getElementById("captureButton");
    const closeButton = document.getElementById("closeCameraButton");

    if (!window.isSecureContext) {
        setStatus("Camera access requires HTTPS or localhost.");
        return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("Camera access is not supported by this browser.");
        return;
    }

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: "environment" },
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        });

        video.srcObject = cameraStream;
        video.hidden = false;
        captureButton.hidden = false;
        closeButton.hidden = false;

        await video.play();
        setStatus("Camera ready. Position the text and capture it.");
    } catch (error) {
        console.error("Camera error:", error);
        setStatus("Camera permission was denied or unavailable.");
    }
}

async function getOcrWorker(language) {
    if (ocrWorker && ocrLanguage === language) {
        return ocrWorker;
    }

    if (ocrWorker) {
        await ocrWorker.terminate();
        ocrWorker = null;
    }

    setStatus("Loading OCR language data…");

    ocrWorker = await Tesseract.createWorker(language, 1, {
        logger: message => {
            if (message.status === "loading language") {
                setStatus("Loading OCR language…");
            }

            if (message.status === "recognizing text") {
                const progress = Math.round(
                    (message.progress || 0) * 100
                );

                setStatus(`Reading text… ${progress}%`);
            }
        }
    });

    ocrLanguage = language;
    return ocrWorker;
}

async function captureImage() {
    const video = document.getElementById("camera");
    const canvas = document.getElementById("canvas");
    const captureButton = document.getElementById("captureButton");
    const language = document.getElementById("ocrLanguage").value;

    if (!video.videoWidth || !video.videoHeight) {
        setStatus("Camera is not ready yet.");
        return;
    }

    if (!window.Tesseract) {
        setStatus("OCR library failed to load.");
        return;
    }

    captureButton.disabled = true;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d", {
        willReadFrequently: true
    });

    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    try {
        const worker = await getOcrWorker(language);
        const result = await worker.recognize(canvas);
        const text = result.data.text.trim();

        if (!text) {
            setStatus(
                "No text detected. Try better lighting or hold the camera steady."
            );
            return;
        }

        if (language === "eng") {
            document.getElementById("englishInput").value = text;
            await translateEnglishToHindi();
        } else {
            document.getElementById("hindiText").value = text;
            await translateHindiToEnglish();
        }

        setStatus("Text detected and translated.");
    } catch (error) {
        console.error("OCR error:", error);
        setStatus("Could not read or translate the captured text.");
    } finally {
        captureButton.disabled = false;
    }
}

async function closeCamera() {
    cameraStream?.getTracks().forEach(track => track.stop());
    cameraStream = null;

    const video = document.getElementById("camera");
    const captureButton = document.getElementById("captureButton");
    const closeButton = document.getElementById("closeCameraButton");

    video.pause();
    video.srcObject = null;
    video.hidden = true;
    captureButton.hidden = true;
    closeButton.hidden = true;

    setStatus("Camera closed.");
}

window.addEventListener("beforeunload", () => {
    cameraStream?.getTracks().forEach(track => track.stop());
    ocrWorker?.terminate();
});

<script src="../js/translateText.js?v=3" defer></script>

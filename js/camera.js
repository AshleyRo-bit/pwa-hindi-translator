/* ---------------------------------------
   CAMERA AND OCR
--------------------------------------- */

let cameraStream = null;
let ocrWorker = null;
let ocrLoading = false;

async function openCamera() {
    const video = document.getElementById("camera");
    const captureButton = document.getElementById("captureButton");

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
        video.style.display = "block";
        captureButton.style.display = "block";

        await video.play();
        setStatus("Camera ready. Position the text and tap Capture.");
    } catch (error) {
        console.error("Camera error:", error);
        setStatus("Camera permission was denied or unavailable.");
    }
}

async function captureImage() {
    const video = document.getElementById("camera");
    const canvas = document.getElementById("canvas");
    const captureButton = document.getElementById("captureButton");
    const hindiInput = document.getElementById("hindiText");

    if (!video.videoWidth || !video.videoHeight) {
        setStatus("Camera is not ready yet.");
        return;
    }

    if (!window.Tesseract) {
        setStatus("OCR library failed to load.");
        return;
    }

    captureButton.disabled = true;
    setStatus("Capturing image…");

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
        if (!ocrWorker) {
            ocrLoading = true;
            setStatus("Loading Hindi OCR language data…");

            ocrWorker = await Tesseract.createWorker("hin+eng", 1, {
                logger: message => {
                    if (message.status === "loading language") {
                        setStatus("Loading OCR language…");
                    }

                    if (message.status === "recognizing text") {
                        const percent = Math.round(
                            (message.progress || 0) * 100
                        );

                        setStatus(`Reading text… ${percent}%`);
                    }
                }
            });

            ocrLoading = false;
        }

        setStatus("Reading text from image…");

        const result = await ocrWorker.recognize(canvas);
        const text = result.data.text.trim();

        if (!text) {
            setStatus(
                "No text detected. Use better lighting and hold the camera steady."
            );
            return;
        }

        hindiInput.value = text;
        hindiInput.lang = "hi";
        hindiInput.dir = "auto";

        setStatus("Text detected. You can now translate it.");
    } catch (error) {
        console.error("OCR error:", error);
        setStatus("Could not read text from the image.");
    } finally {
        captureButton.disabled = false;
    }
}

function closeCamera() {
    cameraStream?.getTracks().forEach(track => track.stop());

    const video = document.getElementById("camera");
    const captureButton = document.getElementById("captureButton");

    video.srcObject = null;
    video.style.display = "none";
    captureButton.style.display = "none";
}

window.addEventListener("beforeunload", () => {
    cameraStream?.getTracks().forEach(track => track.stop());
    ocrWorker?.terminate();
});

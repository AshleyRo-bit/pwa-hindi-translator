
/* ---------------------------------------
   CAMERA
--------------------------------------- */

async function openCamera() {

    const video =
        document.getElementById("camera");

    const capture =
        document.getElementById("captureButton");

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: {
                        ideal: "environment"
                    }
                },
                audio: false
            });

        video.srcObject = stream;

        video.style.display = "block";
        capture.style.display = "block";

        setStatus("Camera ready.");

    } catch (error) {

        console.error(error);

        setStatus(
            "Camera permission was denied or unavailable."
        );
    }
}


function captureImage() {

    const video =
        document.getElementById("camera");

    const canvas =
        document.getElementById("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context =
        canvas.getContext("2d");

    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    setStatus(
        "Image captured. OCR will be added next."
    );
}

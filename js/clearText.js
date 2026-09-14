

/* ---------------------------------------
   CLEAR
--------------------------------------- */

function clearText() {

    document
        .getElementById("hindiText")
        .value = "";

    document
        .getElementById("hindiText")
        .dataset.finalText = "";

    document
        .getElementById("englishText")
        .textContent =
            "Translation will appear here.";

    setStatus("Ready.");
}


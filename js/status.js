
/* ---------------------------------------
   STATUS
--------------------------------------- */

function setStatus(message, listening = false) {

    const status =
        document.getElementById("status");

    status.textContent = message;

    if (listening) {

        status.classList.add("listening");

    } else {

        status.classList.remove("listening");
    }
}
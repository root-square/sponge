/*!-----------------------------------------------------------------------------
 * Copyright (c) handbros(root-square). All rights reserved.
 * Version: 0.7.0(dev)
 * Released under the MIT license
 * https://github.com/root-square/sponge/blob/main/LICENSE
 *-----------------------------------------------------------------------------*/
window.addEventListener("load", () => {
    // Get queries from the URL and display it.
    let url = new URL(window.location.href);
    let urlParams = url.searchParams;

    let typeElement = document.getElementById("text-error-type");
    if (urlParams.has("type")) {
        typeElement.innerText = decodeURIComponent(urlParams.get("type"));
    } else {
        typeElement.innerText = "WB_ERR_NULL_REFERENCE";
    }

    let descElement = document.getElementById("text-error-desc");
    if (urlParams.has("desc")) {
        descElement.innerText = decodeURIComponent(urlParams.get("desc"));
    } else {
        descElement.innerText = "Unable to parse an error information.";
    }

    let stacktraceElement = document.getElementById("text-error-stacktrace");
    if (urlParams.has("stacktrace")) {
        stacktraceElement.innerText = decodeURIComponent(urlParams.get("stacktrace"));
    } else {
        stacktraceElement.innerText = "An exception stack trace is not available.";
    }
});

window.addEventListener("keydown", (e) => {
    if (e.key == "F5") {
        window.location.href = "../../../index.html";
    }
});
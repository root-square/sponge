/*!-----------------------------------------------------------------------------
 * Copyright (c) handbros(root-square). All rights reserved.
 * Version: 0.2.0(dev)
 * Released under the MIT license
 * https://github.com/root-square/sponge/blob/main/LICENSE
 *-----------------------------------------------------------------------------*/
window.addEventListener("load", () => {
    var url = new URL(window.location.href);
    var urlParams = url.searchParams;

    var typeElement = document.getElementById("text-error-type");
    if (urlParams.has("type")) {
        typeElement.innerText = decodeURIComponent(urlParams.get("type"));
    } else {
        typeElement.innerText = "WB_ERR_NULL_REFERENCE";
    }

    var descElement = document.getElementById("text-error-desc");
    if (urlParams.has("desc")) {
        descElement.innerText = decodeURIComponent(urlParams.get("desc"));
    } else {
        descElement.innerText = "Unable to parse an error information."
    }

    var stacktraceElement = document.getElementById("text-error-stacktrace");
    if (urlParams.has("stacktrace")) {
        stacktraceElement.innerText = decodeURIComponent(urlParams.get("stacktrace"));
    } else {
        stacktraceElement.innerText = "NULL"
    }
});

window.addEventListener("keydown", (e) => {
    if (e.code == "F5") {
        location.reload();
    }
});
/*!-----------------------------------------------------------------------------
 * Copyright (c) handbros(root-square). All rights reserved.
 * Version: 0.2.0(dev)
 * Released under the MIT license
 * https://github.com/root-square/sponge/blob/main/LICENSE
 *-----------------------------------------------------------------------------*/
window.addEventListener("load", () => {
    var url = new URL(window.location.href);
    var urlParams = url.searchParams;

    var codeElement = document.getElementById("text-code");
    if (urlParams.has("code")) {
        codeElement.innerText = urlParams.get("code");
    } else {
        codeElement.innerText = "NULL";
    }

    var messageElement = document.getElementById("text-message");
    if (urlParams.has("message")) {
        messageElement.innerText = urlParams.get("message");
    } else {
        messageElement.innerText = "NULL"
    }
});

window.addEventListener("keydown", (e) => {
    if (e.code == "F5") {
        location.reload();
    }
});
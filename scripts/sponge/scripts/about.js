/*!-----------------------------------------------------------------------------
 * Copyright (c) handbros(root-square). All rights reserved.
 * Version: 0.2.1(dev)
 * Released under the MIT license
 * https://github.com/root-square/sponge/blob/main/LICENSE
 *-----------------------------------------------------------------------------*/
window.addEventListener("load", () => {
    // Note: If a referer exists, show the prev button.
    var url = new URL(window.location.href);
    var urlParams = url.searchParams;

    if (urlParams.has("referer")) {
        document.getElementById("btn-prev").style.display = "inline-block";
    } else {
        document.getElementById("btn-prev").style.display = "none";
    }

    // Display the version information.
    var mode = "release"
    var version = "0.2.0";

    switch (mode) {
        case "development":
            changeStatus("danger", "activity animate-flicker", "Sponge System", `Version ${version} (Development Build)`);
            break;
        case "pre-release":
            changeStatus("warning", "lightning-charge-fill", "Sponge System", `Version ${version} (Pre-release Build)`);
            break;
        case "release":
            changeStatus("primary", "check-lg", "Sponge System", `Version ${version} (Release Build)`);
            break;
        default:
            changeStatus("danger", "question-lg", "Sponge System", `Version ${version} (Unknown Build)`);
    }
});

function changeStatus(type, icon, desc, ver) {
    document.getElementById("badge-status").className = `badge rounded-pill text-bg-${type} ms-1`;
    document.getElementById("badge-status-icon").className = `bi bi-${icon}`;
    document.getElementById("text-desc").innerText = desc;
    document.getElementById("text-ver").innerText = ver;
}

function copyToClipboard(text) {
    var clipboard = nw.Clipboard.get();
    clipboard.set(text, 'text');

    var toastCopy = document.getElementById('toast-copy');
    var toastCopyInstance = bootstrap.Toast.getOrCreateInstance(toastCopy);
    toastCopyInstance.show();
}

function backToReferer() {
    var url = new URL(window.location.href);
    var urlParams = url.searchParams;
    window.location.href = urlParams.get("referer");
}
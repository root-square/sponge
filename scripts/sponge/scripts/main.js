/*!-----------------------------------------------------------------------------
 * Copyright (c) handbros(root-square). All rights reserved.
 * Version: 0.2.0(dev)
 * Released under the MIT license
 * https://github.com/root-square/sponge/blob/main/LICENSE
 *-----------------------------------------------------------------------------*/
window.addEventListener("load", () => {
    // Enable tooltips.
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(elem => new bootstrap.Tooltip(elem));

    // Initialize components.
    (async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        WORKBENCH_UI.initLists();
    })();
});

window.addEventListener("resize", () => {
    
});

var start = 0;
var end = 0;

var WORKBENCH_UI = {
    fileList: Array.from({ length: 1000 }, (_, i) => ({
        filename: `test${i}.png`,
        fullpath: `./pictures/systems/test${i}.png`,
    })),
    fileListNodePool: Array.from({ length: 30}, (_, i) => {
        const element = document.createElement("button");
        element.type = "button";
        element.className = "list-group-item list-group-item-action bg-dark-subtle d-flex align-items-center border-0 border-bottom-1";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.className = "form-check-input m-0";

        const icon = document.createElement("i");
        icon.className = "bi bi-list-ul ms-2 me-1";
        icon.style.fontSize = "1.0rem";

        const text = document.createElement("span");
        text.innerText = "NULL";

        element.appendChild(input);
        element.appendChild(icon);
        element.appendChild(text);

        document.getElementById("list-file").appendChild(element);
        return element;
    }),
    ignoreList: null,
    conversionFormat: "avif",
    viewerMode: "preview-raw",
    operationMode: "encode",
    initLists: () => {
        var fileListElement = document.getElementById("list-file");
        const placeholder = document.createElement("div");
        placeholder.style.height = `${WORKBENCH_UI.fileList.length * 40}px`;
        fileListElement.appendChild(placeholder);

        var fileListContainer = document.getElementById("container-file-list");
        fileListContainer.addEventListener("scroll", () => {
            const scrollTop = fileListContainer.scrollTop;
            start = Math.floor(scrollTop / 40);
            end = start + 30;
            WORKBENCH_UI.renderLists();
        });
        
        WORKBENCH_UI.renderLists();
    },
    renderLists: () => {
        const visibleData = WORKBENCH_UI.fileList.slice(start, Math.min(end, WORKBENCH_UI.fileList.length));
        for (let i = 0; i < WORKBENCH_UI.fileListNodePool.length; i++) {
            const div = WORKBENCH_UI.fileListNodePool[i];
            if (i < visibleData.length) {
                const item = visibleData[i];
                div.ariaLabel = item.fullpath;
                div.querySelector("input").ariaLabel = item.fullpath;
                div.querySelector("span").textContent = item.comment;
                div.style.top = `${(start + i) * 40}px`; // Update the position of the node based on its index in the data array
            } else {
                div.style.display = "none"; // Hide the node if it's not in the visible range
            }
        }
    },
    changeConversionFormat: (format) => {
        switch (format) {
            case "avif":
                WORKBENCH_UI.conversionFormat = "avif";
                break;
            case "heif":
                WORKBENCH_UI.conversionFormat = "heif";
                break;
            case "jxl":
                WORKBENCH_UI.conversionFormat = "jxl";
                break;
            case "webp":
                WORKBENCH_UI.conversionFormat = "webp";
                break;
            default:
                WORKBENCH_UI.conversionFormat = "avif";
        }

        document.getElementById("btn-format").innerText = WORKBENCH_UI.conversionFormat.replace("jxl", "jpeg xl").toUpperCase();
    },
    changeViewerMode: (mode) => {
        switch (mode) {
            case "preview-raw":
                WORKBENCH_UI.viewerMode = "preview-raw";
                document.getElementById("tab-preview").className = "nav-link active dropdown-toggle";
                document.getElementById("tab-preview").innerText = "Preview(RAW)"
                document.getElementById("tab-metadata").className = "nav-link";
                break;
            case "preview-processed":
                WORKBENCH_UI.viewerMode = "preview-processed";
                document.getElementById("tab-preview").className = "nav-link active dropdown-toggle";
                document.getElementById("tab-preview").innerText = "Preview(PROCESSED)"
                document.getElementById("tab-metadata").className = "nav-link";
                break;
            case "metadata":
                WORKBENCH_UI.viewerMode = "metadata";
                document.getElementById("tab-preview").className = "nav-link dropdown-toggle";
                document.getElementById("tab-preview").innerText = "Preview"
                document.getElementById("tab-metadata").className = "nav-link active";
                break;
            default:
                WORKBENCH_UI.viewerMode = "preview-raw";
                document.getElementById("tab-preview").className = "nav-link active dropdown-toggle";
                document.getElementById("tab-preview").innerText = "Preview(RAW)"
                document.getElementById("tab-metadata").className = "nav-link";
        }
    },
    changeOperationMode: (mode) => {
        switch (mode) {
            case "encode":
                WORKBENCH_UI.operationMode = "encode";
                break;
            case "decode":
                WORKBENCH_UI.operationMode = "decode";
                break;
            case "check":
                WORKBENCH_UI.operationMode = "check";
                break;
            default:
                WORKBENCH_UI.operationMode = "encode";
        }

        document.getElementById("btn-start").innerText = WORKBENCH_UI.operationMode.toUpperCase();
    },
    
}
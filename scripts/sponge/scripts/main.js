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

        WORKBENCH.fileListSize = document.getElementById("list-file").scrollHeight;
        WORKBENCH.initLists();
    })();
});

window.addEventListener("resize", () => {
    WORKBENCH.resizeLists();
});

var VirtualizedList = window.VirtualizedList.default;

var WORKBENCH = {
    fileObjects: [{"filename": "test2.png"},{"filename": "test2.png"},{"filename": "test2.png"},{"filename": "test2.png"},{"filename": "test2.png"},{"filename": "test2.png"},{"filename": "test2.png"},{"filename": "test2.png"},{"filename": "test2.png"},{"filename": "test2.png"},{"filename": "test2.png"},{"filename": "test2.png"},{"filename": "test2.png"},{"filename": "test2.png"},{"filename": "test2.png"},{"filename": "test2.png"},{"filename": "test2.png"}],
    fileList: null,
    fileListSize: 0,
    ignoreObjects: [],
    ignoreList: null,
    conversionFormat: "avif",
    viewerMode: "preview-raw",
    operationMode: "encode",
    initLists: () => {
        var fileListContainer = document.getElementById("list-file");
        WORKBENCH.fileList = new VirtualizedList(fileListContainer, {
            height: WORKBENCH.fileListSize, // The height of the container
            rowCount: WORKBENCH.fileObjects.length,
            rowHeight: 1,
            estimatedRowHeight: 40,
            renderRow: (index) => {
                const element = document.createElement("button");
                element.type = "button";
                element.className = "list-group-item list-group-item-action bg-dark-subtle d-flex align-items-center border-0 border-bottom-1";
                element.ariaLabel = index;

                var input = document.createElement("input");
                input.type = "checkbox";
                input.className = "form-check-input m-0";
                input.ariaLabel = index;

                var icon = document.createElement("i");
                icon.className = "bi bi-file-earmark-image ms-2 me-1";
                icon.style.fontSize = "1.0rem";

                var text = document.createElement("span");
                text.innerText = WORKBENCH.fileObjects[index].filename;

                element.appendChild(input);
                element.appendChild(icon);
                element.appendChild(text);
          
                return element;
            },
        });

        var ignoreListContainer = document.getElementById("list-ignore");
        WORKBENCH.ignoreList = new VirtualizedList(ignoreListContainer, {
            height: ignoreListContainer.scrollHeight, // The height of the container
            rowCount: 0,
            rowHeight: 40,
            renderRow: (index) => {
                const element = document.createElement('div');
                element.innerHTML = WORKBENCH.ignoreObjects[index];
          
                return element;
            },
        });
    },
    resizeLists: () => {
        var fileListContainer = document.getElementById("list-file");
        WORKBENCH.fileList.resize(fileListContainer.scrollHeight, () => {
            WORKBENCH.fileList.setRowCount(WORKBENCH.fileObjects.length);
        });

        var ignoreListContainer = document.getElementById("list-ignore");
        WORKBENCH.ignoreList.resize(ignoreListContainer.scrollHeight, () => {
            WORKBENCH.ignoreList.setRowCount(WORKBENCH.ignoreObjects.length);
        });
    },
    renderLists: () => {
        WORKBENCH.fileList.setRowCount(WORKBENCH.fileObjects.length);
        WORKBENCH.ignoreList.setRowCount(WORKBENCH.ignoreObjects.length);
    },
    changeConversionFormat: (format) => {
        switch (format) {
            case "avif":
                WORKBENCH.conversionFormat = "avif";
                break;
            case "heif":
                WORKBENCH.conversionFormat = "heif";
                break;
            case "jxl":
                WORKBENCH.conversionFormat = "jxl";
                break;
            case "webp":
                WORKBENCH.conversionFormat = "webp";
                break;
            default:
                WORKBENCH.conversionFormat = "avif";
        }

        document.getElementById("btn-format").innerText = WORKBENCH.conversionFormat.replace("jxl", "jpeg xl").toUpperCase();
    },
    changeViewerMode: (mode) => {
        switch (mode) {
            case "preview-raw":
                WORKBENCH.viewerMode = "preview-raw";
                document.getElementById("tab-preview").className = "nav-link active dropdown-toggle";
                document.getElementById("tab-preview").innerText = "Preview(RAW)"
                document.getElementById("tab-metadata").className = "nav-link";
                break;
            case "preview-processed":
                WORKBENCH.viewerMode = "preview-processed";
                document.getElementById("tab-preview").className = "nav-link active dropdown-toggle";
                document.getElementById("tab-preview").innerText = "Preview(PROCESSED)"
                document.getElementById("tab-metadata").className = "nav-link";
                break;
            case "metadata":
                WORKBENCH.viewerMode = "metadata";
                document.getElementById("tab-preview").className = "nav-link dropdown-toggle";
                document.getElementById("tab-preview").innerText = "Preview"
                document.getElementById("tab-metadata").className = "nav-link active";
                break;
            default:
                WORKBENCH.viewerMode = "preview-raw";
                document.getElementById("tab-preview").className = "nav-link active dropdown-toggle";
                document.getElementById("tab-preview").innerText = "Preview(RAW)"
                document.getElementById("tab-metadata").className = "nav-link";
        }
    },
    changeOperationMode: (mode) => {
        switch (mode) {
            case "encode":
                WORKBENCH.operationMode = "encode";
                break;
            case "decode":
                WORKBENCH.operationMode = "decode";
                break;
            case "check":
                WORKBENCH.operationMode = "check";
                break;
            default:
                WORKBENCH.operationMode = "encode";
        }

        document.getElementById("btn-start").innerText = WORKBENCH.operationMode.toUpperCase();
    },
    
}
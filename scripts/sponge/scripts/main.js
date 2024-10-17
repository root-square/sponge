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
    WORKBENCH_UI.list.init();
});

window.addEventListener("resize", () => {
    
});

var WORKBENCH_UI = {
    list: {
        fileList: Array.from({ length: 100 }, (_, i) => ({
            filename: `test${i}.png`,
            fullpath: `./pictures/systems/test${i}.png`,
        })),
        fileListNodePool: Array.from({ length: 30 }, (_, i) => {
            const element = document.createElement("button");
            element.type = "button";
            element.className = "list-group-item list-group-item-action bg-dark-subtle d-flex align-items-center position-absolute border-0 border-bottom-1";
    
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
    
            document.getElementById("file-list").appendChild(element);
            return element;
        }),
        fileListStart: 0,
        fileListEnd: 30,
        fileListItemHeight: 40,
        ignoreList: Array.from({ length: 50 }, (_, i) => ({
            filename: `test${i}.png`,
            fullpath: `./pictures/systems/test${i}.png`,
        })),
        ignoreListNodePool: Array.from({ length: 30 }, (_, i) => {
            const element = document.createElement("button");
            element.type = "button";
            element.className = "list-group-item list-group-item-action bg-dark-subtle d-flex align-items-center position-absolute border-0 border-bottom-1";
    
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
    
            document.getElementById("ignore-list").appendChild(element);
            return element;
        }),
        ignoreListStart: 0,
        ignoreListEnd: 30,
        ignoreListItemHeight: 40,
        init: () => {
            // To make scrolling area, add a placeholder to the list element.
            var fileListElement = document.getElementById("file-list");
            const filePlaceholder = document.createElement("div");
            filePlaceholder.style.height = `${WORKBENCH_UI.list.fileList.length * WORKBENCH_UI.list.fileListItemHeight}px`;
            fileListElement.appendChild(filePlaceholder);

            var ignoreListElement = document.getElementById("ignore-list");
            const ignorePlaceholder = document.createElement("div");
            ignorePlaceholder.style.height = `${WORKBENCH_UI.list.ignoreList.length * WORKBENCH_UI.list.ignoreListItemHeight}px`;
            ignoreListElement.appendChild(ignorePlaceholder);

            // Add event listener to re-render the list, when scrolling the list.
            var fileListContainer = document.getElementById("file-list-container");
            fileListContainer.addEventListener("scroll", () => {
                const scrollTop = fileListContainer.scrollTop;
                WORKBENCH_UI.list.fileListStart = Math.floor(scrollTop / WORKBENCH_UI.list.fileListItemHeight);
                WORKBENCH_UI.list.fileListEnd = WORKBENCH_UI.list.fileListStart + 30;
                WORKBENCH_UI.list.render("file-list");
            });

            var ignoreListContainer = document.getElementById("ignore-list-container");
            ignoreListContainer.addEventListener("scroll", () => {
                const scrollTop = ignoreListContainer.scrollTop;
                WORKBENCH_UI.list.ignoreListStart = Math.floor(scrollTop / WORKBENCH_UI.list.ignoreListItemHeight);
                WORKBENCH_UI.list.ignoreListEnd = WORKBENCH_UI.list.ignoreListStart + 30;
                WORKBENCH_UI.list.render("ignore-list");
            });
            
            WORKBENCH_UI.list.renderAll();
        },
        render: (target) => {
            if (target == "file-list") {
                const visibleData = WORKBENCH_UI.list.fileList.slice(WORKBENCH_UI.list.fileListStart, Math.min(WORKBENCH_UI.list.fileListEnd, WORKBENCH_UI.list.fileList.length));
    
                for (let i = 0; i < WORKBENCH_UI.list.fileListNodePool.length; i++) {
                    const item = WORKBENCH_UI.list.fileListNodePool[i];
    
                    if (i < visibleData.length) {
                        const data = visibleData[i];
                        item.ariaLabel = data.fullpath;
                        item.querySelector("input").ariaLabel = data.fullpath;
                        item.querySelector("span").textContent = data.filename;
                        item.style.top = `${(WORKBENCH_UI.list.fileListStart + i) * WORKBENCH_UI.list.fileListItemHeight}px`; // Update the position of the node based on its index in the data array
                        item.classList.replace("d-none", "d-flex");
                    } else {
                        item.classList.replace("d-flex", "d-none"); // Hide the node if it's not in the visible range
                    }
                }
            } else if (target == "ignore-list") {
                const visibleData = WORKBENCH_UI.list.ignoreList.slice(WORKBENCH_UI.list.ignoreListStart, Math.min(WORKBENCH_UI.list.ignoreListEnd, WORKBENCH_UI.list.ignoreList.length));
    
                for (let i = 0; i < WORKBENCH_UI.list.ignoreListNodePool.length; i++) {
                    const item = WORKBENCH_UI.list.ignoreListNodePool[i];
    
                    if (i < visibleData.length) {
                        const data = visibleData[i];
                        item.ariaLabel = data.fullpath;
                        item.querySelector("input").ariaLabel = data.fullpath;
                        item.querySelector("span").textContent = data.filename;
                        item.style.top = `${(WORKBENCH_UI.list.ignoreListStart + i) * WORKBENCH_UI.list.ignoreListItemHeight}px`; // Update the position of the node based on its index in the data array
                        item.classList.replace("d-none", "d-flex");
                    } else {
                        item.classList.replace("d-flex", "d-none"); // Hide the node if it's not in the visible range
                    }
                }
            }
        },
        renderAll: () => {
            WORKBENCH_UI.list.render("file-list");
            WORKBENCH_UI.list.render("ignore-list");
        },
    },
    form: {
        conversionFormat: "avif",
        viewerMode: "preview-raw",
        operationMode: "encode",
        changeConversionFormat: (format) => {
            switch (format) {
                case "avif":
                    WORKBENCH_UI.form.conversionFormat = "avif";
                    break;
                case "heif":
                    WORKBENCH_UI.form.conversionFormat = "heif";
                    break;
                case "jxl":
                    WORKBENCH_UI.form.conversionFormat = "jxl";
                    break;
                case "webp":
                    WORKBENCH_UI.form.conversionFormat = "webp";
                    break;
                default:
                    WORKBENCH_UI.form.conversionFormat = "avif";
            }
    
            document.getElementById("btn-format").innerText = WORKBENCH_UI.form.conversionFormat.replace("jxl", "jpeg xl").toUpperCase();
        },
        changeViewerMode: (mode) => {
            switch (mode) {
                case "preview-raw":
                    WORKBENCH_UI.form.viewerMode = "preview-raw";
                    document.getElementById("tab-preview").className = "nav-link active dropdown-toggle";
                    document.getElementById("tab-preview").innerText = "Preview(RAW)"
                    document.getElementById("tab-metadata").className = "nav-link";
                    break;
                case "preview-processed":
                    WORKBENCH_UI.form.viewerMode = "preview-processed";
                    document.getElementById("tab-preview").className = "nav-link active dropdown-toggle";
                    document.getElementById("tab-preview").innerText = "Preview(PROCESSED)"
                    document.getElementById("tab-metadata").className = "nav-link";
                    break;
                case "metadata":
                    WORKBENCH_UI.form.viewerMode = "metadata";
                    document.getElementById("tab-preview").className = "nav-link dropdown-toggle";
                    document.getElementById("tab-preview").innerText = "Preview"
                    document.getElementById("tab-metadata").className = "nav-link active";
                    break;
                default:
                    WORKBENCH_UI.form.viewerMode = "preview-raw";
                    document.getElementById("tab-preview").className = "nav-link active dropdown-toggle";
                    document.getElementById("tab-preview").innerText = "Preview(RAW)"
                    document.getElementById("tab-metadata").className = "nav-link";
            }
        },
        changeOperationMode: (mode) => {
            switch (mode) {
                case "encode":
                    WORKBENCH_UI.form.operationMode = "encode";
                    break;
                case "decode":
                    WORKBENCH_UI.form.operationMode = "decode";
                    break;
                case "check":
                    WORKBENCH_UI.form.operationMode = "check";
                    break;
                default:
                    WORKBENCH_UI.form.operationMode = "encode";
            }
    
            document.getElementById("btn-start").innerText = WORKBENCH_UI.form.operationMode.toUpperCase();
        },
    },    
}
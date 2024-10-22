/*!-----------------------------------------------------------------------------
 * Copyright (c) handbros(root-square). All rights reserved.
 * Version: 0.2.1(dev)
 * Released under the MIT license
 * https://github.com/root-square/sponge/blob/main/LICENSE
 *-----------------------------------------------------------------------------*/
window.addEventListener("load", () => {
    // Enable tooltips.
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(elem => new bootstrap.Tooltip(elem));
    
    WORKBENCH_UI.lists.init();
    WORKBENCH_UI.props.init();

    WORKBENCH_UI.lists.open("./");
});

let WORKBENCH_UI = {
    lists: {
        // Note: data structure -> isSelected(bool), isDirectory(bool), filename(str), fullname(str)
        fileList: [],
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
        ignoreList: [],
        ignoreListNodePool: Array.from({ length: 30 }, (_, i) => {
            const element = document.createElement("button");
            element.type = "button";
            element.className = "list-group-item list-group-item-action bg-dark-subtle d-flex align-items-center position-absolute border-0 border-bottom-1";
    
            const input = document.createElement("input");
            input.type = "checkbox";
            input.className = "form-check-input m-0";
    
            const icon = document.createElement("i");
            icon.className = "bi bi-image-ul ms-2 me-1";
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
            let fileListElement = document.getElementById("file-list");
            const filePlaceholder = document.createElement("div");
            filePlaceholder.style.height = `${WORKBENCH_UI.lists.fileList.length * WORKBENCH_UI.lists.fileListItemHeight}px`;
            fileListElement.appendChild(filePlaceholder);

            let ignoreListElement = document.getElementById("ignore-list");
            const ignorePlaceholder = document.createElement("div");
            ignorePlaceholder.style.height = `${WORKBENCH_UI.lists.ignoreList.length * WORKBENCH_UI.lists.ignoreListItemHeight}px`;
            ignoreListElement.appendChild(ignorePlaceholder);

            // Add event listener to re-render the list, when scrolling the list.
            let fileListContainer = document.getElementById("file-list-container");
            fileListContainer.addEventListener("scroll", () => {
                const scrollTop = fileListContainer.scrollTop;
                WORKBENCH_UI.lists.fileListStart = Math.floor(scrollTop / WORKBENCH_UI.lists.fileListItemHeight);
                WORKBENCH_UI.lists.fileListEnd = WORKBENCH_UI.lists.fileListStart + 30;
                WORKBENCH_UI.lists.render("file-list");
            });

            let ignoreListContainer = document.getElementById("ignore-list-container");
            ignoreListContainer.addEventListener("scroll", () => {
                const scrollTop = ignoreListContainer.scrollTop;
                WORKBENCH_UI.lists.ignoreListStart = Math.floor(scrollTop / WORKBENCH_UI.lists.ignoreListItemHeight);
                WORKBENCH_UI.lists.ignoreListEnd = WORKBENCH_UI.lists.ignoreListStart + 30;
                WORKBENCH_UI.lists.render("ignore-list");
            });
            
            WORKBENCH_UI.lists.renderAll();
        },
        render: (target) => {
            if (target === "file-list") {
                const visibleData = WORKBENCH_UI.lists.fileList.slice(WORKBENCH_UI.lists.fileListStart, Math.min(WORKBENCH_UI.lists.fileListEnd, WORKBENCH_UI.lists.fileList.length));
    
                for (let i = 0; i < WORKBENCH_UI.lists.fileListNodePool.length; i++) {
                    const item = WORKBENCH_UI.lists.fileListNodePool[i];
    
                    if (i < visibleData.length) {
                        const data = visibleData[i];
                        item.ariaLabel = data.fullpath;
                        item.querySelector("input").ariaLabel = data.fullpath;
                        item.querySelector("span").textContent = data.filename;
                        item.style.top = `${(WORKBENCH_UI.lists.fileListStart + i) * WORKBENCH_UI.lists.fileListItemHeight}px`; // Update the position of the node based on its index in the data array
                        item.classList.replace("d-none", "d-flex");
                    } else {
                        item.classList.replace("d-flex", "d-none"); // Hide the node if it's not in the visible range
                    }
                }
            } else if (target === "ignore-list") {
                const visibleData = WORKBENCH_UI.lists.ignoreList.slice(WORKBENCH_UI.lists.ignoreListStart, Math.min(WORKBENCH_UI.lists.ignoreListEnd, WORKBENCH_UI.lists.ignoreList.length));
    
                for (let i = 0; i < WORKBENCH_UI.lists.ignoreListNodePool.length; i++) {
                    const item = WORKBENCH_UI.lists.ignoreListNodePool[i];
    
                    if (i < visibleData.length) {
                        const data = visibleData[i];
                        item.ariaLabel = data.fullpath;
                        item.querySelector("input").ariaLabel = data.fullpath;
                        item.querySelector("span").textContent = data.filename;
                        item.style.top = `${(WORKBENCH_UI.lists.ignoreListStart + i) * WORKBENCH_UI.lists.ignoreListItemHeight}px`; // Update the position of the node based on its index in the data array
                        item.classList.replace("d-none", "d-flex");
                    } else {
                        item.classList.replace("d-flex", "d-none"); // Hide the node if it's not in the visible range
                    }
                }
            }
        },
        renderAll: () => {
            WORKBENCH_UI.lists.render("file-list");
            WORKBENCH_UI.lists.render("ignore-list");
        },
        reset: (target) => {
            if (target === "file-list") {
                document.getElementById("file-list-container").scrollTop = 0;
                WORKBENCH_UI.lists.fileListStart = 0;
                WORKBENCH_UI.lists.fileListEnd = 30;
            } else if (target === "ignore-list") {
                document.getElementById("ignore-list-container").scrollTop = 0;
                WORKBENCH_UI.lists.ignoreListStart = 0;
                WORKBENCH_UI.lists.ignoreListEnd = 30;
            }
        },
        select: (fullname) => [

        ],
        transfer: (direction) => {
            if (direction.toLowerCase() === "up") {

            } else if (direction.toLowerCase() === "down") {

            }
        },
        view: (fullname) => {
            
        },
        open: (path) => {
            if (!fs.existsSync(path)) {
                return;
            }
            if (!fs.statSync(path).isDirectory()) {
                return;
            }

            let items = [];
            
            // Note: fs.readdir() uses process.cwd().
            let targetPath = path.resolve(path.relative(process.cwd(), SPONGE.workDirectory), path);

            fs.readdir(targetPath, { encoding: "utf-8", withFileTypes: true }, function(err, entries) {
                for (let entry of entries) {
                    let parentPath = typeof entry.parentPath === "undefined" || entry.parentPath === null ? entry.path : entry.parentPath;
                    let item = { isSelected: false, isDirectory: entry.isDirectory(), filename: entry.name, fullname: path.resolve(parentPath, entry.name) };
                    items.append(item);
                }
            })

            WORKBENCH_UI.lists.reset("file-list");
            WORKBENCH_UI.lists.render("file-list");
        }
    },
    props: {
        conversionFormat: "avif",
        viewerMode: "preview-raw",
        operationMode: "encode",
        init: () => {
            WORKBENCH_UI.props.readOptions();
        },
        changeConversionFormat: (format) => {
            switch (format) {
                case "avif":
                    WORKBENCH_UI.props.conversionFormat = "avif";
                    break;
                case "heif":
                    WORKBENCH_UI.props.conversionFormat = "heif";
                    break;
                case "jxl":
                    WORKBENCH_UI.props.conversionFormat = "jxl";
                    break;
                case "webp":
                    WORKBENCH_UI.props.conversionFormat = "webp";
                    break;
                default:
                    WORKBENCH_UI.props.conversionFormat = "avif";
            }
    
            document.getElementById("btn-format").innerText = WORKBENCH_UI.props.conversionFormat.replace("jxl", "jpeg xl").toUpperCase();
        },
        changeViewerMode: (mode) => {
            switch (mode) {
                case "preview-raw":
                    WORKBENCH_UI.props.viewerMode = "preview-raw";
                    document.getElementById("tab-preview").className = "nav-link active dropdown-toggle";
                    document.getElementById("tab-preview").innerText = "Preview(RAW)"
                    document.getElementById("tab-metadata").className = "nav-link";
                    break;
                case "preview-processed":
                    WORKBENCH_UI.props.viewerMode = "preview-processed";
                    document.getElementById("tab-preview").className = "nav-link active dropdown-toggle";
                    document.getElementById("tab-preview").innerText = "Preview(PROCESSED)"
                    document.getElementById("tab-metadata").className = "nav-link";
                    break;
                case "metadata":
                    WORKBENCH_UI.props.viewerMode = "metadata";
                    document.getElementById("tab-preview").className = "nav-link dropdown-toggle";
                    document.getElementById("tab-preview").innerText = "Preview"
                    document.getElementById("tab-metadata").className = "nav-link active";
                    break;
                default:
                    WORKBENCH_UI.props.viewerMode = "preview-raw";
                    document.getElementById("tab-preview").className = "nav-link active dropdown-toggle";
                    document.getElementById("tab-preview").innerText = "Preview(RAW)"
                    document.getElementById("tab-metadata").className = "nav-link";
            }
        },
        changeOperationMode: (mode) => {
            switch (mode) {
                case "encode":
                    WORKBENCH_UI.props.operationMode = "encode";
                    break;
                case "decode":
                    WORKBENCH_UI.props.operationMode = "decode";
                    break;
                case "check":
                    WORKBENCH_UI.props.operationMode = "check";
                    break;
                default:
                    WORKBENCH_UI.props.operationMode = "encode";
            }
    
            document.getElementById("btn-start").innerText = WORKBENCH_UI.props.operationMode.toUpperCase();
        },
        readOptions: () => {
            let settingsPath = path.resolve(SPONGE.workDirectory, "js/libs/sponge.json");
            let settingsJson = null;
            if (fs.existsSync(settingsPath)) {
                settingsJson = JSON.parse(fs.readFileSync(settingsPath));
            } else {
                try {
                    settingsJson = { mode: "unknown", version: "0.1.0", options: { avif: "", heif: "", jxl: "", png: "", webp: "" } };
                    fs.writeFileSync(settingsPath, JSON.stringify(settingsJson));
                } catch (err) {
                    SPONGE_WORKBENCH.error("WB_IO_SETTINGS_NOT_AVAILABLE", "Cannot read the settings data and write a new data.", err.stack);
                }
            }
            
            let formats = ["avif", "heif", "jxl", "png", "webp"];

            for (let format of formats) {
                if (Object.hasOwn(settingsJson.options, format)) {
                    document.getElementById(`options-${format}`).value = settingsJson.options[format];
                }
            }
        },
        writeOptions: (format) => {
            let settingsPath = path.resolve(SPONGE.workDirectory, "js/libs/sponge.json");
            let settingsJson = null;
            if (fs.existsSync(settingsPath)) {
                settingsJson = JSON.parse(fs.readFileSync(settingsPath));
            } else {
                try {
                    settingsJson = { mode: "unknown", version: "0.1.0", options: { avif: "", heif: "", jxl: "", png: "", webp: "" } };
                    fs.writeFileSync(settingsPath, JSON.stringify(settingsJson));
                } catch (err) {
                    SPONGE_WORKBENCH.error("WB_IO_SETTINGS_NOT_AVAILABLE", "Cannot read the settings data and write a new data.", err.stack);
                }
            }

            settingsJson.options[format] = document.getElementById(`options-${format}`).value;

            try {
                fs.writeFileSync(settingsPath, JSON.stringify(settingsJson));

                WORKBENCH_UI.status.setToast("Saved successfully!");
            } catch (err) {
                SPONGE_WORKBENCH.error("WB_IO_SETTINGS_NOT_WRITABLE", "Cannot write a new settings data.", err.stack);
            }
        }
    },
    status: {
        setToast: (text) => {
            document.getElementById('toast-notice-text').innerText = text;

            let toast = document.getElementById('toast-notice');
            let toastInstance = bootstrap.Toast.getOrCreateInstance(toast);
            toastInstance.show();
        },
        setText: (text) => {
            document.getElementById('status-text').innerText = text;
        },
        setProgress: (progress) => {
            document.getElementById('status-bar').ariaValueNow = progress;
            document.getElementById('status-bar-inner').style.width = `${progress}%`;
        }
    },
    misc: {
        about: () => {
            let params = new URLSearchParams();

            let settingsPath = path.resolve(SPONGE.workDirectory, "js/libs/sponge.json");
            if (fs.existsSync(settingsPath)) {
                let settingsJson = JSON.parse(fs.readFileSync(settingsPath));
                params.append("mode", settingsJson.mode);
                params.append("version", settingsJson.version);
            }

            params.append("referer", "./main.html?silent=main");

            window.location.href = `./about.html?${params.toString()}`;
        }
    }
}
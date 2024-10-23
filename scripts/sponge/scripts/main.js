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
    
    WORKBENCH_UI.files.init();
    WORKBENCH_UI.props.init();

    WORKBENCH_UI.files.open("./");
});

let WORKBENCH_UI = {
    files: {
        historyList: [],
        historyPointer: 0,
        // Note: data structure -> isSelected(bool), isDirectory(bool), name(str), fullname(str)
        navList: [],
        navListNodePool: Array.from({ length: 30 }, (_, i) => {
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
    
            document.getElementById("nav-list").appendChild(element);
            return element;
        }),
        navListStart: 0,
        navListEnd: 30,
        navListItemHeight: 40,
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
            let navListElement = document.getElementById("nav-list");
            const filePlaceholder = document.createElement("div");
            filePlaceholder.style.height = `${WORKBENCH_UI.files.navList.length * WORKBENCH_UI.files.navListItemHeight}px`;
            navListElement.appendChild(filePlaceholder);

            let ignoreListElement = document.getElementById("ignore-list");
            const ignorePlaceholder = document.createElement("div");
            ignorePlaceholder.style.height = `${WORKBENCH_UI.files.ignoreList.length * WORKBENCH_UI.files.ignoreListItemHeight}px`;
            ignoreListElement.appendChild(ignorePlaceholder);

            // Add event listener to re-render the list, when scrolling the list.
            let navListContainer = document.getElementById("nav-list-container");
            navListContainer.addEventListener("scroll", () => {
                const scrollTop = navListContainer.scrollTop;
                WORKBENCH_UI.files.navListStart = Math.floor(scrollTop / WORKBENCH_UI.files.navListItemHeight);
                WORKBENCH_UI.files.navListEnd = WORKBENCH_UI.files.navListStart + 30;
                WORKBENCH_UI.files.render("nav-list");
            });

            let ignoreListContainer = document.getElementById("ignore-list-container");
            ignoreListContainer.addEventListener("scroll", () => {
                const scrollTop = ignoreListContainer.scrollTop;
                WORKBENCH_UI.files.ignoreListStart = Math.floor(scrollTop / WORKBENCH_UI.files.ignoreListItemHeight);
                WORKBENCH_UI.files.ignoreListEnd = WORKBENCH_UI.files.ignoreListStart + 30;
                WORKBENCH_UI.files.render("ignore-list");
            });
            
            WORKBENCH_UI.files.renderAll();
        },
        render: (target) => {
            if (target === "nav-list") {
                const visibleData = WORKBENCH_UI.files.navList.slice(WORKBENCH_UI.files.navListStart, Math.min(WORKBENCH_UI.files.navListEnd, WORKBENCH_UI.files.navList.length));
    
                for (let i = 0; i < WORKBENCH_UI.files.navListNodePool.length; i++) {
                    const item = WORKBENCH_UI.files.navListNodePool[i];
    
                    if (i < visibleData.length) {
                        const data = visibleData[i];
                        item.ariaLabel = data.fullname;
                        item.querySelector("input").ariaLabel = data.fullname;
                        item.querySelector("span").textContent = data.name;
                        item.style.top = `${(WORKBENCH_UI.files.navListStart + i) * WORKBENCH_UI.files.navListItemHeight}px`; // Update the position of the node based on its index in the data array
                        item.classList.replace("d-none", "d-flex");
                    } else {
                        item.classList.replace("d-flex", "d-none"); // Hide the node if it's not in the visible range
                    }
                }
            } else if (target === "ignore-list") {
                const visibleData = WORKBENCH_UI.files.ignoreList.slice(WORKBENCH_UI.files.ignoreListStart, Math.min(WORKBENCH_UI.files.ignoreListEnd, WORKBENCH_UI.files.ignoreList.length));
    
                for (let i = 0; i < WORKBENCH_UI.files.ignoreListNodePool.length; i++) {
                    const item = WORKBENCH_UI.files.ignoreListNodePool[i];
    
                    if (i < visibleData.length) {
                        const data = visibleData[i];
                        item.ariaLabel = data.fullname;
                        item.querySelector("input").ariaLabel = data.fullname;
                        item.querySelector("span").textContent = data.name;
                        item.style.top = `${(WORKBENCH_UI.files.ignoreListStart + i) * WORKBENCH_UI.files.ignoreListItemHeight}px`; // Update the position of the node based on its index in the data array
                        item.classList.replace("d-none", "d-flex");
                    } else {
                        item.classList.replace("d-flex", "d-none"); // Hide the node if it's not in the visible range
                    }
                }
            }
        },
        renderAll: () => {
            WORKBENCH_UI.files.render("nav-list");
            WORKBENCH_UI.files.render("ignore-list");
        },
        reset: (target) => {
            if (target === "nav-list") {
                document.getElementById("nav-list-container").scrollTop = 0;
                WORKBENCH_UI.files.navListStart = 0;
                WORKBENCH_UI.files.navListEnd = 30;
            } else if (target === "ignore-list") {
                document.getElementById("ignore-list-container").scrollTop = 0;
                WORKBENCH_UI.files.ignoreListStart = 0;
                WORKBENCH_UI.files.ignoreListEnd = 30;
            }
        },
        history: (newPath, direction) => {
            function updateAvailability() {
                let navToBackButton = document.getElementById("btn-nav-to-back");
                let navToForwardButton = document.getElementById("btn-nav-to-forward");
                
                if (WORKBENCH_UI.files.historyPointer > 0) {
                    navToBackButton.classList.remove("disabled");
                } else {
                    navToBackButton.classList.add("disabled");
                }

                if (WORKBENCH_UI.files.historyPointer < WORKBENCH_UI.files.historyList.length - 1) {
                    navToForwardButton.classList.remove("disabled");
                } else {
                    navToForwardButton.classList.add("disabled");
                }
            }
            
            if (direction === null || direction === "none") {
                // Remove the right portion of the pointer, and append a new path.
                if (WORKBENCH_UI.files.historyPointer >= 0 && WORKBENCH_UI.files.historyPointer < WORKBENCH_UI.files.historyList.length) {
                    WORKBENCH_UI.files.historyForward.splice(WORKBENCH_UI.files.historyPointer, WORKBENCH_UI.files.historyList.length - WORKBENCH_UI.files.historyPointer);
                }
                WORKBENCH_UI.files.historyList.append(newPath);
                WORKBENCH_UI.files.historyPointer = WORKBENCH_UI.files.historyList.length - 1;
                
                updateAvailability();

                return newPath;
            } else if (direction === "back") {
                // Move the pointer to leftside(-1).
                if (WORKBENCH_UI.files.historyPointer - 1 >= 0) {
                    WORKBENCH_UI.files.historyPointer -= 1;
                }
                
                updateAvailability();

                return WORKBENCH_UI.files.historyList[WORKBENCH_UI.files.historyPointer];
            } else if (direction === "forward") {
                // Move the pointer to rightside(+1).
                if (WORKBENCH_UI.files.historyPointer + 1 < WORKBENCH_UI.files.historyList.length) {
                    WORKBENCH_UI.files.historyPointer += 1;
                }

                updateAvailability();

                return WORKBENCH_UI.files.historyList[WORKBENCH_UI.files.historyPointer];
            }
        },
        navigateToBack: () => {
            let targetPath = WORKBENCH_UI.files.history(null, "back");
            WORKBENCH_UI.files.navigateWithPath(targetPath, false);
        },
        navigateToForward: () => {
            let targetPath = WORKBENCH_UI.files.history(null, "forward");
            WORKBENCH_UI.files.navigateWithPath(targetPath, false);
        },
        navigateWithIndex: (index, setHistory) => {
            if (!isNaN(index) && index >= 0 && index <= WORKBENCH_UI.files.navList.length) {
                WORKBENCH_UI.files.navigateWithPath(WORKBENCH_UI.files.navList[index].fullname, setHistory);
            }
        },
        navigateWithPath: (targetPath, setHistory) => {
            if (!fs.existsSync(targetPath)) {
                return;
            }
            if (!fs.statSync(targetPath).isDirectory()) {
                return;
            }

            let items = [];
            
            // Note: fs.readdir() uses process.cwd().
            // Read the directory and append it to the navigation list.
            let fullPath = path.resolve(path.relative(process.cwd(), SPONGE.workDirectory), targetPath);

            fs.readdir(fullPath, { encoding: "utf-8", withFileTypes: true }, function(err, entries) {
                for (let entry of entries) {
                    let parentPath = typeof entry.parentPath === "undefined" || entry.parentPath === null ? entry.path : entry.parentPath;
                    let item = { isSelected: false, isDirectory: entry.isDirectory(), name: entry.name, fullname: path.resolve(parentPath, entry.name) };
                    items.append(item);
                }
            })

            // Set the history.
            if (setHistory !== null && setHistory) {
                WORKBENCH_UI.files.history(fullPath, "none");
            }

            WORKBENCH_UI.files.navList = items;
            WORKBENCH_UI.files.reset("nav-list");
            WORKBENCH_UI.files.render("nav-list");
        },
        switch: (target, index) => {
            if (target === "nav-list" && !isNaN(index) && index >= 0 && index <= WORKBENCH_UI.files.navList.length) {
                let item = WORKBENCH_UI.files.navList[index];

                if (typeof item.isSelected === "boolean") {
                    item.isSelected = !item.isSelected;
                }

                WORKBENCH_UI.files.render("nav-list");
            } else if (target === "ignore-list" && !isNaN(index) && index >= 0 && index <= WORKBENCH_UI.files.ignoreList.length) {
                let item = WORKBENCH_UI.files.ignoreList[index];

                if (typeof item.isSelected === "boolean") {
                    item.isSelected = !item.isSelected;
                }

                WORKBENCH_UI.files.render("ignore-list");
            }
        },
        transfer: (direction) => {
            if (direction.toLowerCase() === "up") {
                for (let i = WORKBENCH_UI.files.ignoreList.length-1; i >= 0; i--) {
                    let item = WORKBENCH_UI.files.ignoreList[i];

                    if (item.isSelected) {
                        WORKBENCH_UI.files.ignoreList.splice(i, 1);
                    }
                } 

                WORKBENCH_UI.files.reset("ignore-list");
                WORKBENCH_UI.files.render("ignore-list");
            } else if (direction.toLowerCase() === "down") {
                for (let i = 0; i < WORKBENCH_UI.files.fileList.length; i++) {
                    let item = WORKBENCH_UI.files.fileList[i];

                    if (item.isSelected && !item.isDirectory) {
                        item.isSelected = false;
                        WORKBENCH_UI.files.ignoreList.append(item);
                    }
                }
                
                WORKBENCH_UI.files.ignoreList.sort((a, b) => b.name.localeCompare(a.name));

                WORKBENCH_UI.files.reset("ignore-list");
                WORKBENCH_UI.files.render("nav-list");
                WORKBENCH_UI.files.render("ignore-list");
            }
        },
        view: (index) => {
            
        },
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
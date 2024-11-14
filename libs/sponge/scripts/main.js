/*!-----------------------------------------------------------------------------
 * Copyright (c) handbros(root-square). All rights reserved.
 * Version: 0.5.0(dev)
 * Released under the MIT license
 * https://github.com/root-square/sponge/blob/main/LICENSE
 *-----------------------------------------------------------------------------*/
window.addEventListener("load", () => {
    // Enable tooltips.
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(elem => new bootstrap.Tooltip(elem));
    
    // Initialize components.
    WORKBENCH.files.init();
    WORKBENCH.props.init();

    WORKBENCH.files.navigateWithPath("./", true);
});

let WORKBENCH = {
    files: {
        historyList: [],
        historyPointer: 0,
        // Note: data structure -> isSelected(bool), isDirectory(bool), name(str), fullname(str)
        navList: [],
        navListNodePool: Array.from({ length: 30 }, (_, i) => {
            const element = document.createElement("button");
            element.type = "button";
            element.className = "list-group-item list-group-item-action bg-dark-subtle d-flex align-items-center position-absolute overflow-x-hidden border-0 border-bottom-1";

            const input = document.createElement("input");
            input.type = "checkbox";
            input.className = "form-check-input m-0";
    
            const icon = document.createElement("i");
            icon.className = "bi bi-list-ul ms-2 me-1";
            icon.style.fontSize = "1.0rem";
    
            const text = document.createElement("span");
            text.className = "text-nowrap";
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
            element.className = "list-group-item list-group-item-action bg-dark-subtle d-flex align-items-center position-absolute overflow-x-hidden border-0 border-bottom-1";
    
            const input = document.createElement("input");
            input.type = "checkbox";
            input.className = "form-check-input m-0";
    
            const icon = document.createElement("i");
            icon.className = "bi bi-image-ul ms-2 me-1";
            icon.style.fontSize = "1.0rem";
    
            const text = document.createElement("span");
            text.className = "text-nowrap";
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
            // Preset: Add ignores for RMMV.
            if (SPONGE.rpgMakerName === "MV") {
                let item = { isSelected: false, isDirectory: false, name: "Window.png", fullname: "www\\img\\system\\Window.png" };
                WORKBENCH.files.ignoreList.push(item);
            }

            // To make scrolling area, add a placeholder to the list element.
            let navListElement = document.getElementById("nav-list");
            const filePlaceholder = document.createElement("div");
            filePlaceholder.id = "nav-list-placeholder";
            filePlaceholder.style.height = `${WORKBENCH.files.navList.length * WORKBENCH.files.navListItemHeight}px`;
            navListElement.appendChild(filePlaceholder);

            let ignoreListElement = document.getElementById("ignore-list");
            const ignorePlaceholder = document.createElement("div");
            ignorePlaceholder.id = "ignore-list-placeholder";
            ignorePlaceholder.style.height = `${WORKBENCH.files.ignoreList.length * WORKBENCH.files.ignoreListItemHeight}px`;
            ignoreListElement.appendChild(ignorePlaceholder);

            // Add event listeners to re-render the list, when scrolling the list.
            let navListContainer = document.getElementById("nav-list-container");
            navListContainer.addEventListener("scroll", () => {
                const scrollTop = navListContainer.scrollTop;
                WORKBENCH.files.navListStart = Math.floor(scrollTop / WORKBENCH.files.navListItemHeight);
                WORKBENCH.files.navListEnd = WORKBENCH.files.navListStart + 30;
                WORKBENCH.files.render("nav-list");
            });

            let ignoreListContainer = document.getElementById("ignore-list-container");
            ignoreListContainer.addEventListener("scroll", () => {
                const scrollTop = ignoreListContainer.scrollTop;
                WORKBENCH.files.ignoreListStart = Math.floor(scrollTop / WORKBENCH.files.ignoreListItemHeight);
                WORKBENCH.files.ignoreListEnd = WORKBENCH.files.ignoreListStart + 30;
                WORKBENCH.files.render("ignore-list");
            });

            // Add event listeners to provide keyboard interactions.
            let navPathInput = document.getElementById("input-nav-path");
            navPathInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    
                    WORKBENCH.files.navigateWithPath(navPathInput.value, true);
                    navPathInput.blur();
                }
            });
            navPathInput.addEventListener("focusout", () => {
                navPathInput.value = WORKBENCH.files.historyList[WORKBENCH.files.historyPointer];
            })

            WORKBENCH.files.renderAll();
        },
        render: (target) => {
            if (target === "nav-list") {
                const visibleData = WORKBENCH.files.navList.slice(WORKBENCH.files.navListStart, Math.min(WORKBENCH.files.navListEnd, WORKBENCH.files.navList.length));
    
                for (let i = 0; i < WORKBENCH.files.navListNodePool.length; i++) {
                    const item = WORKBENCH.files.navListNodePool[i];
    
                    if (i < visibleData.length) {
                        const data = visibleData[i];
                        const dataIndex = WORKBENCH.files.navListStart + i;

                        if (data.isSelected) {
                            item.querySelector("input").checked = true;
                            item.querySelector("input").setAttribute("checked", "");
                        } else {
                            item.querySelector("input").checked = false;
                            item.querySelector("input").removeAttribute("checked");
                        }

                        if (data.isDirectory) {
                            item.querySelector("input").setAttribute("disabled", "");
                            item.querySelector("i").className = "bi bi-folder ms-2 me-1";
                        } else {
                            item.querySelector("input").removeAttribute("disabled");
                            item.querySelector("i").className = "bi bi-file-earmark-text ms-2 me-1";
                        }
                        
                        item.setAttribute("onclick", `WORKBENCH.files.onClicked(${dataIndex})`);
                        item.setAttribute("ondblclick", `WORKBENCH.files.onDoubleClicked(${dataIndex})`);
                        item.querySelector("input").setAttribute("onchange", `WORKBENCH.files.onSwitched('nav-list', ${dataIndex})`);
                        item.querySelector("span").textContent = data.name;

                        item.style.top = `${(dataIndex) * WORKBENCH.files.navListItemHeight}px`; // Update the position of the node based on its index in the data array
                        item.classList.replace("d-none", "d-flex");
                    } else {
                        item.classList.replace("d-flex", "d-none"); // Hide the node if it's not in the visible range
                    }
                }
            } else if (target === "ignore-list") {
                const visibleData = WORKBENCH.files.ignoreList.slice(WORKBENCH.files.ignoreListStart, Math.min(WORKBENCH.files.ignoreListEnd, WORKBENCH.files.ignoreList.length));
    
                for (let i = 0; i < WORKBENCH.files.ignoreListNodePool.length; i++) {
                    const item = WORKBENCH.files.ignoreListNodePool[i];
    
                    if (i < visibleData.length) {
                        const data = visibleData[i];
                        const dataIndex = WORKBENCH.files.ignoreListStart + i;

                        if (data.isSelected) {
                            item.querySelector("input").checked = true;
                            item.querySelector("input").setAttribute("checked", "");
                        } else {
                            item.querySelector("input").checked = false;
                            item.querySelector("input").removeAttribute("checked");
                        }

                        item.querySelector("input").setAttribute("onchange", `WORKBENCH.files.onSwitched('ignore-list', ${dataIndex})`);
                        item.querySelector("i").className = "bi bi-file-earmark-text ms-2 me-1";
                        item.querySelector("span").textContent = data.name;

                        item.style.top = `${(dataIndex) * WORKBENCH.files.ignoreListItemHeight}px`; // Update the position of the node based on its index in the data array
                        item.classList.replace("d-none", "d-flex");
                    } else {
                        item.classList.replace("d-flex", "d-none"); // Hide the node if it's not in the visible range
                    }
                }
            }
        },
        renderAll: () => {
            WORKBENCH.files.render("nav-list");
            WORKBENCH.files.render("ignore-list");
        },
        reset: (target) => {
            if (target === "nav-list") {
                document.getElementById("nav-list-placeholder").style.height = `${WORKBENCH.files.navList.length * WORKBENCH.files.navListItemHeight}px`;
                document.getElementById("nav-list-container").scrollTop = 0;
                WORKBENCH.files.navListStart = 0;
                WORKBENCH.files.navListEnd = 30;
            } else if (target === "ignore-list") {
                document.getElementById("ignore-list-placeholder").style.height = `${WORKBENCH.files.ignoreList.length * WORKBENCH.files.ignoreListItemHeight}px`;
                document.getElementById("ignore-list-container").scrollTop = 0;
                WORKBENCH.files.ignoreListStart = 0;
                WORKBENCH.files.ignoreListEnd = 30;
            }
        },
        history: (newPath, direction) => {
            function updateAvailability() {
                let navToBackButton = document.getElementById("btn-nav-to-back");
                let navToForwardButton = document.getElementById("btn-nav-to-forward");
                
                if (WORKBENCH.files.historyPointer > 0) {
                    navToBackButton.removeAttribute("disabled");
                } else {
                    navToBackButton.setAttribute("disabled", "");
                }

                if (WORKBENCH.files.historyPointer < WORKBENCH.files.historyList.length - 1) {
                    navToForwardButton.removeAttribute("disabled");
                } else {
                    navToForwardButton.setAttribute("disabled", "");
                }
            }

            if (direction === null || direction === "none") {
                // Remove the right portion of the pointer, and append a new path.
                if (WORKBENCH.files.historyList.length !== 0 && WORKBENCH.files.historyPointer !== WORKBENCH.files.historyList.length - 1) {
                    WORKBENCH.files.historyList.splice(WORKBENCH.files.historyPointer + 1, WORKBENCH.files.historyList.length - WORKBENCH.files.historyPointer);
                }
                WORKBENCH.files.historyList.push(newPath);
                WORKBENCH.files.historyPointer = WORKBENCH.files.historyList.length - 1;
                
                updateAvailability();

                return newPath;
            } else if (direction === "back") {
                // Move the pointer to leftside(-1).
                if (WORKBENCH.files.historyPointer - 1 >= 0) {
                    WORKBENCH.files.historyPointer -= 1;
                }
                
                updateAvailability();

                return WORKBENCH.files.historyList[WORKBENCH.files.historyPointer];
            } else if (direction === "forward") {
                // Move the pointer to rightside(+1).
                if (WORKBENCH.files.historyPointer + 1 < WORKBENCH.files.historyList.length) {
                    WORKBENCH.files.historyPointer += 1;
                }

                updateAvailability();

                return WORKBENCH.files.historyList[WORKBENCH.files.historyPointer];
            }
        },
        navigateToBack: () => {
            // Get a back history and navigate to it.
            // In the process, we trust the path from the history list.
            let targetPath = WORKBENCH.files.history(null, "back");
            WORKBENCH.files.navigateWithPath(targetPath, false);
        },
        navigateToForward: () => {
            // Get a forward history and navigate to it.
            // In the process, we trust the path from the history list.
            let targetPath = WORKBENCH.files.history(null, "forward");
            WORKBENCH.files.navigateWithPath(targetPath, false);
        },
        navigateWithIndex: (index, setHistory = false) => {
            if (!isNaN(index) && index >= 0 && index <= WORKBENCH.files.navList.length) {
                WORKBENCH.files.navigateWithPath(WORKBENCH.files.navList[index].fullname, setHistory);
            }
        },
        navigateWithPath: (targetPath, setHistory = false) => {
            if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
                WORKBENCH.status.showToast("Cannot find the directory.");
                return;
            }
            
            // Note: fs.readdir() uses process.cwd().
            // Read the directory and append it to the navigation list.
            let basePath = path.relative(process.cwd(), SPONGE.workDirectory);
            let fullPath = targetPath.startsWith(basePath) ? targetPath : path.join(basePath, targetPath);

            let entries = fs.readdirSync(fullPath, { encoding: "utf-8", withFileTypes: true });

            let items = [];
            for (let i = 0; i < entries.length; i++) {
                let entry = entries[i];
                let parentPath = typeof entry.parentPath === "undefined" || entry.parentPath === null ? entry.path : entry.parentPath;
                let item = { isSelected: false, isDirectory: entry.isDirectory(), name: entry.name, fullname: path.join(parentPath, entry.name) };
                items.push(item);
            }

            if (typeof setHistory !== "undefined" && setHistory) {
                WORKBENCH.files.history(fullPath, "none");
            }
            
            // Display the current path.
            document.getElementById("input-nav-path").value = WORKBENCH.files.historyList[WORKBENCH.files.historyPointer];

            // Clear the nav list and append items.
            WORKBENCH.files.navList.splice(0, WORKBENCH.files.navList.length);
            WORKBENCH.files.navList.push(...items);

            // Sort the nav list by the 'isDirectory' flag.
            WORKBENCH.files.navList.sort((a, b) => (a.isDirectory === b.isDirectory)? 0 : a.isDirectory ? -1 : 1); // Sort the nav list by 'isDirectory'.

            WORKBENCH.files.reset("nav-list");
            WORKBENCH.files.render("nav-list");
        },
        switch: (target, index) => {
            if (target === "nav-list" && !isNaN(index) && index >= 0 && index <= WORKBENCH.files.navList.length) {
                let item = WORKBENCH.files.navList[index];

                if (typeof item.isSelected === "boolean") {
                    item.isSelected = !item.isSelected;
                }

                WORKBENCH.files.render("nav-list");
            } else if (target === "ignore-list" && !isNaN(index) && index >= 0 && index <= WORKBENCH.files.ignoreList.length) {
                let item = WORKBENCH.files.ignoreList[index];

                if (typeof item.isSelected === "boolean") {
                    item.isSelected = !item.isSelected;
                }

                WORKBENCH.files.render("ignore-list");
            }
        },
        transfer: (direction) => {
            if (direction.toLowerCase() === "up") {
                for (let i = WORKBENCH.files.ignoreList.length-1; i >= 0; i--) {
                    let item = WORKBENCH.files.ignoreList[i];

                    if (item.isSelected) {
                        WORKBENCH.files.ignoreList.splice(i, 1);
                    }
                } 

                WORKBENCH.files.reset("ignore-list");
                WORKBENCH.files.render("ignore-list");
            } else if (direction.toLowerCase() === "down") {
                for (let i = 0; i < WORKBENCH.files.navList.length; i++) {
                    let item = WORKBENCH.files.navList[i];

                    if (item.isSelected && !item.isDirectory) {
                        item.isSelected = false;

                        // If the ignore list does not contain the item, add it.
                        if (!WORKBENCH.files.ignoreList.some((obj) => obj.fullname === item.fullname)) {
                            WORKBENCH.files.ignoreList.push(item);
                        }
                    }
                }
                
                // Sort by filename.
                WORKBENCH.files.ignoreList.sort((a, b) => b.name.localeCompare(a.name));

                WORKBENCH.files.reset("ignore-list");
                WORKBENCH.files.render("nav-list");
                WORKBENCH.files.render("ignore-list");
            }
        },
        view: (index, refresh = false) => {
            const viewer = document.getElementById("viewer");

            if (index < 0 || index >= WORKBENCH.files.navList.length) return;
            if (refresh && (viewer.ariaLabel === null || typeof viewer.ariaLabel === 'undefined' || viewer.ariaLabel === "")) return;

            // Revoke the current image URL to prevent memory leak.
            var imgs = viewer.querySelectorAll("img");
            imgs.forEach(function (item) {
                URL.revokeObjectURL(item.src);
            });

            WORKBENCH.status.setViewerMessage("Loading..."); // Note: This removes all viewer contents before showing a message.

            // Get an arraybuffer with XHR, and process it.
            const filePath = path.resolve(refresh === true ? viewer.ariaLabel : WORKBENCH.files.navList[index].fullname);
            const xhr = new XMLHttpRequest();
            xhr.open("GET", filePath);
            xhr.responseType = "arraybuffer";
            xhr.onload = async () => {
                if (xhr.status < 400) {
                    try {
                        let arrayBuffer = xhr.response;
                        arrayBuffer = SPONGE_FUNCTIONS.readSponge(arrayBuffer).body;
                        arrayBuffer = SPONGE_FUNCTIONS.decrypt(arrayBuffer, SPONGE.encryptionKey);

                        const format = SPONGE_FUNCTIONS.isImage(arrayBuffer)
                        if (format === null) {
                            viewer.ariaLabel = filePath;
                            WORKBENCH.status.setViewerMessage(`InvalidOperationError: The selected item is not an image file.`);
                            WORKBENCH.status.setViewerStatus("ERROR");
                            return;
                        }

                        // Process the selected image data.
                        const viewerContent = document.createElement("img");
                        viewerContent.className = "position-absolute w-100 h-100 border border-0 bg-transparent";
                        viewerContent.style.objectFit = "cover";

                        const t0 = performance.now()

                        if (WORKBENCH.props.viewerMode === "raw") {
                            SPONGE_FUNCTIONS.convert(arrayBuffer, "png", { Q: 100, effort: 7, bitdepth: 8, compression: 6, interlace: false }).then((displayData) => {
                                const t1 = performance.now();
                                
                                const blob = new Blob([displayData]);
                                viewerContent.src = URL.createObjectURL(blob);
                                WORKBENCH.status.setViewerStatus(`${format.toUpperCase()} / ${WORKBENCH.utils.humanFileSize(displayData.byteLength, true, 2)} / ${(t1-t0).toFixed(3)}ms`);
                            });
                        } else if (WORKBENCH.props.viewerMode === "processed") {
                            SPONGE_FUNCTIONS.convert(arrayBuffer, WORKBENCH.props.conversionFormat, SPONGE_FUNCTIONS.options[WORKBENCH.props.conversionFormat]).then((convertedData) => {
                                SPONGE_FUNCTIONS.convert(convertedData, "png", { Q: 100, effort: 7, bitdepth: 8, compression: 6, interlace: false }).then((displayData) => {
                                    const t1 = performance.now();
                                
                                    const blob = new Blob([displayData]);
                                    viewerContent.src = URL.createObjectURL(blob);
                                    WORKBENCH.status.setViewerStatus(`${format.toUpperCase()} to ${WORKBENCH.props.conversionFormat.toUpperCase()} / ${WORKBENCH.utils.humanFileSize(convertedData.byteLength, true, 2)}(${(convertedData.byteLength / arrayBuffer.byteLength * 100).toFixed(2)}%) / ${(t1-t0).toFixed(3)}ms`);
                                });
                            });
                        } else {
                            return;
                        }

                        // Display elements.
                        if (!viewer.classList.contains("grid-lines")) {
                            viewer.classList.add("grid-lines");
                        }

                        viewer.innerHTML = "";
                        viewer.ariaLabel = filePath; 
                        viewer.appendChild(viewerContent);
                    } catch (err) {
                        WORKBENCH.status.setViewerMessage(`${err.name}: ${err.message}`);
                    }
                } else {
                    WORKBENCH.status.setViewerMessage(`XMLHttpRequest: Unable to get an image arraybuffer.`);
                    WORKBENCH.status.setViewerStatus("ERROR");
                }
            }
            xhr.onerror = () => {
                WORKBENCH.status.setViewerMessage(`XMLHttpRequest: An unknown error has occurred while loading the image.`);
                WORKBENCH.status.setViewerStatus("ERROR");
            };
            xhr.send();
        },
        onSwitched: function (target, index) {
            if (target !== "nav-list" && target !== "ignore-list") {
                return;
            }

            let item = WORKBENCH.files.navList[index];
            if (!item.isDirectory) {
                WORKBENCH.files.switch(target, index);
            }
        },
        onClicked: function (index) {
            let item = WORKBENCH.files.navList[index];
            if (!item.isDirectory) {
                WORKBENCH.files.view(index);
            }
        },
        onDoubleClicked: function (index) {
            let item = WORKBENCH.files.navList[index];
            if (item.isDirectory) {
                WORKBENCH.files.navigateWithIndex(index, true);
            }
        }
    },
    props: {
        conversionFormat: "avif",
        viewerMode: "raw",
        operationMode: "encode",
        encryptResources: true,
        excludeInferiorities: true,
        ignoreAllExceptPng: true,
        init: () => {
            WORKBENCH.props.readOptions();
        },
        changeConversionFormat: (format) => {
            switch (format) {
                case "avif":
                    WORKBENCH.props.conversionFormat = "avif";
                    break;
                case "jxl":
                    WORKBENCH.props.conversionFormat = "jxl";
                    break;
                case "webp":
                    WORKBENCH.props.conversionFormat = "webp";
                    break;
                default:
                    WORKBENCH.props.conversionFormat = "avif";
            }
    
            document.getElementById("btn-format").innerText = WORKBENCH.props.conversionFormat.replace("jxl", "jpeg xl").toUpperCase();

            WORKBENCH.files.view(null, true);
        },
        changeSwitchSelection: (target) => {
            switch (target) {
                case "encrypt":
                    WORKBENCH.props.encryptResources = document.getElementById("switch-encrypt").checked;
                    break;
                case "exclude-infs":
                    WORKBENCH.props.excludeInferiorities = document.getElementById("switch-exclude-infs").checked;
                    break;
                case "ignore-aep":
                    WORKBENCH.props.ignoreAllExceptPng = document.getElementById("switch-ignore-aep").checked;
                    break;
            }
        },
        changeViewerMode: (mode) => {
            switch (mode) {
                case "raw":
                    WORKBENCH.props.viewerMode = "raw";
                    document.getElementById("tab-raw").className = "nav-link active";
                    document.getElementById("tab-processed").className = "nav-link";
                    break;
                case "processed":
                    WORKBENCH.props.viewerMode = "processed";
                    document.getElementById("tab-raw").className = "nav-link";
                    document.getElementById("tab-processed").className = "nav-link active";
                    break;
                default:
                    WORKBENCH.props.viewerMode = "raw";
                    document.getElementById("tab-raw").className = "nav-link active";
                    document.getElementById("tab-processed").className = "nav-link";
            }

            WORKBENCH.files.view(null, true);
        },
        changeOperationMode: (mode) => {
            switch (mode) {
                case "encode":
                    WORKBENCH.props.operationMode = "encode";
                    break;
                case "decode":
                    WORKBENCH.props.operationMode = "decode";
                    break;
                case "inspect":
                    WORKBENCH.props.operationMode = "inspect";
                    break;
                default:
                    WORKBENCH.props.operationMode = "encode";
            }
    
            document.getElementById("btn-start").innerText = WORKBENCH.props.operationMode.toUpperCase();
        },
        readOptions: () => {
            let settingsPath = path.resolve(SPONGE.workDirectory, "js/libs/sponge.json");
            let settingsJson = null;
            if (fs.existsSync(settingsPath)) {
                settingsJson = JSON.parse(fs.readFileSync(settingsPath));
            } else {
                try {
                    settingsJson = { mode: "unknown", version: "0.1.0", options: { avif: "", jxl: "", png: "", webp: "" } };
                    fs.writeFileSync(settingsPath, JSON.stringify(settingsJson));
                } catch (err) {
                    SPONGE_WORKBENCH.error("WB_IO_SETTINGS_NOT_AVAILABLE", "Failed to read the settings data and write a new data.", err.stack);
                }
            }
            
            let formats = ["avif", "jxl", "png", "webp"];

            for (let format of formats) {
                if (Object.hasOwn(settingsJson.options, format)) {
                    document.getElementById(`options-${format}`).value = settingsJson.options[format];
                    SPONGE_FUNCTIONS.options[format] = SPONGE_FUNCTIONS.interpret(format, settingsJson.options[format]);
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
                    settingsJson = { mode: "unknown", version: "0.1.0", options: { avif: "", jxl: "", png: "", webp: "" } };
                    fs.writeFileSync(settingsPath, JSON.stringify(settingsJson));
                } catch (err) {
                    SPONGE_WORKBENCH.error("WB_IO_SETTINGS_NOT_AVAILABLE", "Failed to read the settings data and write a new data.", err.stack);
                }
            }

            try {
                settingsJson.options[format] = document.getElementById(`options-${format}`).value;
                fs.writeFileSync(settingsPath, JSON.stringify(settingsJson));

                SPONGE_FUNCTIONS.options[format] = SPONGE_FUNCTIONS.interpret(format, settingsJson.options[format]);

                WORKBENCH.status.showToast("Saved successfully!");
            } catch (err) {
                SPONGE_WORKBENCH.error("WB_IO_SETTINGS_NOT_WRITABLE", "Failed to write a new settings data.", err.stack);
            }

            WORKBENCH.files.view(null, true);
        }
    },
    tasks: {
        abortController: null,
        indexFiles: (targetPath, extensions, callback) => {
            if (typeof extension === 'undefined' || extension === null) {
                extensions = [".png", ".rpgmvp", ".png_"];
            }

            fs.readdir(targetPath, { recursive: true, withFileTypes: true }, function (err, files) {
                let ignores = [];
                for (let i = 0 ; i < WORKBENCH.files.ignoreList.length; i++) {
                    ignores.push(path.resolve(WORKBENCH.files.ignoreList[i].fullname));
                }

                callback(err, files.filter(item => !item.isDirectory() && extensions.includes(path.extname(item.name).toLowerCase()) && !ignores.includes(path.resolve(path.join(item.path ? item.path : item.parentPath, item.name)))));
            });
        },
        buildPromise: (type, file) => {
            switch (type.toLowerCase()) {
                case "encode":
                    {
                        return new Promise((resolve, reject) => {    
                            if (WORKBENCH.tasks.abortController.signal.aborted) {
                                reject(new Error("The operation has been aborted."));
                            }
    
                            const parentPath = file.path ? file.path : file.parentPath;
                            const resolvedPath = path.resolve(path.join(parentPath, file.name));
    
                            fs.readFile(resolvedPath, { encoding: null, flag: 'r', signal: WORKBENCH.tasks.abortController.signal }, function(err, nodeBuffer) {
                                try {
                                    if (err) reject(err);
    
                                    let arrayBuffer = nodeBuffer.buffer;
                                    arrayBuffer = SPONGE_FUNCTIONS.readSponge(arrayBuffer).body;
                                    arrayBuffer = SPONGE_FUNCTIONS.decrypt(arrayBuffer, SPONGE.encryptionKey);
    
                                    if (WORKBENCH.props.ignoreAllExceptPng && SPONGE_FUNCTIONS.isImage(arrayBuffer) !== "png") {
                                        reject(new Error("The file is not a PNG file."));
                                    }
        
                                    const convertedData = SPONGE_FUNCTIONS.convert(arrayBuffer, WORKBENCH.props.conversionFormat, SPONGE_FUNCTIONS.options[WORKBENCH.props.conversionFormat]).then((data) => {
                                        if (WORKBENCH.props.excludeInferiorities && arrayBuffer.byteLength <= convertedData.byteLength) {
                                            reject(new Error("The encoded file is larger than the original file."));
                                        }
            
                                        if (WORKBENCH.props.encryptResources) {
                                            convertedData = SPONGE_FUNCTIONS.encrypt(convertedData, SPONGE.encryptionKey);
                                        }
        
                                        convertedData = SPONGE_FUNCTIONS.writeSponge(convertedData, WORKBENCH.props.conversionFormat);
        
                                        fs.writeFile(resolvedPath, convertedData, {flag: 'w+', signal: WORKBENCH.tasks.abortController.signal}).then(() => {
                                            resolve();
                                        }).catch((err) => {
                                            reject(err)
                                        })
                                    }).catch((err) => reject(err));
                                } catch (err) {
                                    reject(err);
                                }
                            });
                        });
                    }
                case "decode":
                    {
                        return new Promise((resolve, reject) => {    
                            if (WORKBENCH.tasks.abortController.signal.aborted) {
                                reject(new Error("The operation has been aborted."));
                            }
    
                            const parentPath = file.path ? file.path : file.parentPath;
                            const resolvedPath = path.resolve(path.join(parentPath, file.name));
    
                            fs.readFile(resolvedPath, { encoding: null, flag: 'r', signal: WORKBENCH.tasks.abortController.signal }, function(err, nodeBuffer) {
                                try {
                                    if (err) reject(err);

                                    let arrayBuffer = nodeBuffer.buffer;
                                    arrayBuffer = SPONGE_FUNCTIONS.readSponge(arrayBuffer).body;
                                    arrayBuffer = SPONGE_FUNCTIONS.decrypt(arrayBuffer, SPONGE.encryptionKey);
    
                                    if (SPONGE_FUNCTIONS.isImage(arrayBuffer) === null) {
                                        reject(new Error("The file is not an image file."));
                                    }
        
                                    const convertedData = SPONGE_FUNCTIONS.convert(arrayBuffer, "png", SPONGE_FUNCTIONS.options.png).then(() => {
                                        if (WORKBENCH.props.encryptResources) {
                                            convertedData = SPONGE_FUNCTIONS.encrypt(convertedData, SPONGE.encryptionKey);
                                        }
        
                                        fs.writeFile(resolvedPath, convertedData, {flag: 'w+', signal: WORKBENCH.tasks.abortController.signal}).then(() => {
                                            resolve();
                                        }).catch((err) => {
                                            reject(err)
                                        })
                                    }).catch((err) => reject(err));
                                } catch (err) {
                                    reject(err);
                                }
                            });
                        });
                    }
                case "inspect":
                    return new Promise((resolve, reject) => {    
                        if (WORKBENCH.tasks.abortController.signal.aborted) {
                            reject(new Error("The operation has been aborted."));
                        }

                        const parentPath = file.path ? file.path : file.parentPath;
                        const resolvedPath = path.resolve(path.join(parentPath, file.name));

                        fs.readFile(resolvedPath, { encoding: null, flag: 'r', signal: WORKBENCH.tasks.abortController.signal }, function(err, nodeBuffer) {
                            try{
                                if (err) reject(err);

                                let arrayBuffer = nodeBuffer.buffer;

                                let result = { isSponge: false, isEncrypted: false, filename: "", format: "" };
    
                                if (SPONGE_FUNCTIONS.isSponge(arrayBuffer)) {
                                    arrayBuffer = SPONGE_FUNCTIONS.readSponge(arrayBuffer).body;
                                    result.isSponge = true;
                                }
    
                                if (SPONGE_FUNCTIONS.isEncrypted(arrayBuffer)) {
                                    arrayBuffer = SPONGE_FUNCTIONS.decrypt(arrayBuffer, SPONGE.encryptionKey);
                                    result.isEncrypted = true;
                                }
    
                                result.filename = resolvedPath;
    
                                result.format = SPONGE_FUNCTIONS.isImage(arrayBuffer);
                                if (result.format === null) {
                                    reject(new Error("Failed to find an image header."));
                                }
                                
                                resolve(result);
                            } catch (err) {
                                reject(err);
                            }
                        });
                    });
                default:
                    break;
            }
        },
        startTask: () => {
            try {
                let targetPath = "./img/";
                if (SPONGE.rpgMakerName === "MV") {
                    targetPath = "./www/img/";
                }

                document.getElementById("task-starter-section").classList.replace("d-inline-flex", "d-none");
                document.getElementById("task-stopper-section").classList.replace("d-none", "d-inline-flex");    

                WORKBENCH.tasks.abortController = new AbortController();

                WORKBENCH.tasks.indexFiles(targetPath, [".png", ".rpgmvp", ".png_"], (err, files) => {
                    if (err) throw err;

                    // Create a promise producer.
                    const producerType = WORKBENCH.props.operationMode;
                    let producerCount = 0;
                    let producer = () => {
                        if (producerCount < files.length) {
                            return WORKBENCH.tasks.buildPromise(producerType, files[producerCount++]);
                        } else {
                            return null;
                        }
                    };

                    // Create a promise pool.
                    let abortFlag = false;
                    let codecResult = { files: { total: 0, success: 0, error: 0 }, options: { avif: SPONGE_FUNCTIONS.options.avif, jxl: SPONGE_FUNCTIONS.options.jxl, png: SPONGE_FUNCTIONS.options.png, webp: SPONGE_FUNCTIONS.options.webp }, errors: [] };
                    let inspctResult = { files: { total: 0, success: 0, error: 0, sponge: 0, crypto: 0 }, formats: { avif:0, jxl: 0, png: 0, webp: 0 }, options: { avif: SPONGE_FUNCTIONS.options.avif, jxl: SPONGE_FUNCTIONS.options.jxl, png: SPONGE_FUNCTIONS.options.png, webp: SPONGE_FUNCTIONS.options.webp }, errors: [] };
                    
                    const concurrency = 4;
                    const pool = new PromisePool(producer, concurrency);
                    
                    pool.addEventListener('fulfilled', function (event) {
                        const resultData = event.data.result;

                        if (WORKBENCH.props.operationMode === "encode" || WORKBENCH.props.operationMode === "decode") {
                            codecResult.files.total += 1;
                            codecResult.files.success += 1;
                        } else if (WORKBENCH.props.operationMode === "inspect") {
                            inspctResult.files.total += 1;
                            inspctResult.files.success += 1;
                            
                            if (resultData.isSponge) {
                                inspctResult.files.sponge += 1;
                            }

                            if (resultData.isEncrypted) {
                                inspctResult.files.crypto += 1;
                            }

                            switch (resultData.format.toLowerCase()) {
                                case "avif":
                                    inspctResult.formats.avif += 1;
                                    break;
                                case "jxl":
                                    inspctResult.formats.jxl += 1;
                                    break;
                                case "png":
                                    inspctResult.formats.png += 1;
                                    break;
                                case "webp":
                                    inspctResult.formats.webp += 1;
                                    break;
                            }
                        }

                        WORKBENCH.status.setProgress(Math.round(producerCount / files.length * 100), `Processing... (${producerCount}/${files.length})`);
                    });
                    
                    pool.addEventListener('rejected', function (event) {
                        const errorData = event.data.error;

                        if (WORKBENCH.props.operationMode === "encode" || WORKBENCH.props.operationMode === "decode") {
                            codecResult.files.total += 1;
                            codecResult.files.error += 1;
                            codecResult.errors.push(errorData);
                        } else if (WORKBENCH.props.operationMode === "inspect") {
                            inspctResult.files.total += 1;
                            inspctResult.files.error += 1;
                            inspctResult.errors.push(errorData);
                        }
                        
                        WORKBENCH.status.setProgress(Math.round(producerCount / files.length * 100), `ERROR: ${event.data.error.message}`);
                    });
                    
                    pool.start().then(() => {                        
                        let result = null;
                        
                        if (WORKBENCH.props.operationMode === "encode" || WORKBENCH.props.operationMode === "decode") {
                            result = JSON.stringify(codecResult);
                        } else if (WORKBENCH.props.operationMode === "inspect") {
                            result = JSON.stringify(inspctResult);
                        }

                        WORKBENCH.tasks.stopTask(false);

                        if (WORKBENCH.tasks.abortController.signal.aborted) {
                            WORKBENCH.status.setProgress(100, `The operation has been aborted.`);
                            WORKBENCH.status.showResultModal(`The operation has been aborted.`, result);
                        } else {
                            WORKBENCH.status.setProgress(100, `Completed successfully!`);
                            WORKBENCH.status.showResultModal(`Completed successfully!`, result);
                        }
                    });
                });
            } catch (err) {
                WORKBENCH.tasks.stopTask(false);
                WORKBENCH.status.showResultModal(`Failed to start an operation.`, err);
                return;
            }
        },
        stopTask: (abort = false) => {
            if (abort) {
                WORKBENCH.tasks.abortController.abort();
            }

            document.getElementById("task-starter-section").classList.replace("d-none", "d-inline-flex");
            document.getElementById("task-stopper-section").classList.replace("d-inline-flex", "d-none");
        }
    },
    status: {
        setViewerMessage: (text) => {
            const viewer = document.getElementById("viewer");
            if (viewer.classList.contains("grid-lines")) {
                viewer.classList.remove("grid-lines");
            }
            viewer.innerHTML = ""
            
            const viewerContent = document.createElement("span");
            viewerContent.className = "position-absolute top-50 start-50 translate-middle text-center text-wrap text-body-secondary fw-light lh-base";
            viewerContent.style.fontSize= "0.9rem";
            viewerContent.innerText = text.replaceAll(/(\n|\r\n)/g, "<br>");
            
            viewer.appendChild(viewerContent);
        },
        setViewerStatus: (text) => {
            const info = document.getElementById("viewer-info");
            info.innerText = text;
        },
        setProgress: (progress, text) => {
            document.getElementById('status-bar').ariaValueNow = progress;
            document.getElementById('status-bar-inner').style.width = `${progress}%`;
            document.getElementById('status-text').innerText = text;
        },
        showToast: (text) => {
            document.getElementById('toast-notice-text').innerText = text;

            let toast = document.getElementById('toast-notice');
            let toastInstance = bootstrap.Toast.getOrCreateInstance(toast);
            toastInstance.show();
        },
        showResultModal: (status, details) => {
            document.getElementById("result-status").value = status;

            if (details instanceof Error || (details && details.stack && details.message)) {
                document.getElementById("result-details").value = `${details.stack}`;
            } else {
                document.getElementById("result-details").value = details;
            }

            const modal = new bootstrap.Modal(document.getElementById('result-modal'), {});
            modal.show();
        },
        copyResultDetails: () => {
            let clipboard = nw.Clipboard.get();
            clipboard.set(document.getElementById("result-details").value, 'text');
        }
    },
    utils: {
        humanFileSize: (bytes, si=false, dp=1) => {
            const thresh = si ? 1000 : 1024;

            if (Math.abs(bytes) < thresh) {
              return bytes + ' B';
            }
          
            const units = si 
              ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
              : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
            let u = -1;
            const r = 10**dp;
          
            do {
              bytes /= thresh;
              ++u;
            } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
          
          
            return bytes.toFixed(dp) + ' ' + units[u];
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

            params.append("referer", "./main.html?workbench=true");

            window.location.href = `./about.html?${params.toString()}`;
        }
    }
}
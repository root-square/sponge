/*!-----------------------------------------------------------------------------
 * Copyright (c) handbros(root-square). All rights reserved.
 * Version: 0.7.0(dev)
 * Released under the MIT license
 * https://github.com/root-square/sponge/blob/main/LICENSE
 *-----------------------------------------------------------------------------*/
'use strict';

const fs = require('fs');
const path = require('path');
const { Buffer } = require('buffer');

let vips = null;
(async () => {
    vips = await Vips();
    vips.Cache.max(0);
})();

window.addEventListener("load", () => {
    let url = new URL(window.location.href);
    let urlParams = url.searchParams;
    if (urlParams.has("workbench")) {
        SPONGE.isWorkbench = true;
    }

    // Initialize components.
    SPONGE.init();
    SPONGE.inject();
});

window.addEventListener("keydown", (e) => {
    if (SPONGE.isWorkbench) {
        return;
    }

    if (SPONGE.spongeMode.toLowerCase() === "development" && (e.key === "Pause" || (e.ctrlKey && e.key === "F7"))) {
        SPONGE_WORKBENCH.main();
    }
});

let SPONGE = {
    isNwjs: false,
    isWorkbench: false,
    isInitialized: false,
    workDirectory: "",
    spongeMode: "",
    spongeVersion: "",
    rpgMakerName: "",
    rpgMakerVersion: "",
    encryptionKey: "",
    init: () => {
        try {
            SPONGE.isNwjs = (typeof require('nw.gui') !== "undefined");
        } catch (err) {
            SPONGE.isNwjs = false;
        }

        // Diagnose the current environment.
        if (!SPONGE.isWorkbench) {
            if (!SPONGE_TESTS.diagnoseEnvironment()) return;
            if (!SPONGE_TESTS.diagnoseEngine()) return;
        }

        let baseDirectory = path.dirname(process.execPath);

        // Parse the actual work directory.
        let pkgPath = path.resolve(baseDirectory, "package.json");
        if (fs.existsSync(pkgPath)) {
            let pkgJson = JSON.parse(fs.readFileSync(pkgPath, { encoding: "utf8", flag: "r" }));
            SPONGE.workDirectory = path.dirname(path.resolve(baseDirectory, pkgJson.main));
        }

        // Parse the RPG Maker information.
        const nameRegex = /(?<=RPGMAKER_NAME\s=\s[\'\"]).+(?=[\'\"])/;
        const versionRegex = /(?<=RPGMAKER_VERSION\s=\s[\'\"]).+(?=[\'\"])/;
        let mvCorePath = path.resolve(SPONGE.workDirectory, "js/rpg_core.js");
        let mzCorePath = path.resolve(SPONGE.workDirectory, "js/rmmz_core.js");

        let code = "";
        if (fs.existsSync(mvCorePath)) {
            code = fs.readFileSync(mvCorePath, { encoding: "utf8", flag: "r" });
        } else if (fs.existsSync(mzCorePath)) {
            code = fs.readFileSync(mzCorePath, { encoding: "utf8", flag: "r" });
        }

        let nameMatches = code.match(nameRegex);
        if (nameMatches !== null) {
            SPONGE.rpgMakerName = nameMatches[0];
        }

        let versionMatches = code.match(versionRegex);
        if (versionMatches !== null) {
            SPONGE.rpgMakerVersion = versionMatches[0];
        }

        // Parse the encryption key.
        const encryptionKeyRegex = /(?<=[\'\"]encryptionKey[\'\"]\s?:\s?[\'\"]).+(?=[\'\"])/;
        let systemPath = path.resolve(SPONGE.workDirectory, "data/System.json");
        if (fs.existsSync(systemPath)) {
            let systemJson = fs.readFileSync(systemPath, { encoding: "utf8", flag: "r" });
            let keyMatches = systemJson.match(encryptionKeyRegex);

            if (keyMatches !== null) {
                SPONGE.encryptionKey = keyMatches[0];
            }
        }

        // Parse the sponge metadata.
        const formats = ["avif", "jxl", "png", "webp"];
        const settingsPath = path.resolve(SPONGE.workDirectory, "js/libs/sponge.json");
        let settingsJson = null;
        if (fs.existsSync(settingsPath)) {
            settingsJson = JSON.parse(fs.readFileSync(settingsPath));
        } else {
            try {
                settingsJson = { mode: "unknown", version: "0.1.0", options: { avif: "", jxl: "", png: "", webp: "" } };
                fs.writeFileSync(settingsPath, JSON.stringify(settingsJson));
            } catch (err) {
                SPONGE_WORKBENCH.error("SPONGE_SETTINGS_NOT_AVAILABLE", "Failed to read the settings data and write a new data.", err.stack);
            }
        }

        SPONGE.spongeMode = settingsJson.mode;
        SPONGE.spongeVersion = settingsJson.version;

        for (let format of formats) {
            if (Object.hasOwn(settingsJson.options, format)) {
                SPONGE_FUNCTIONS.options[format] = SPONGE_FUNCTIONS.interpret(format, settingsJson.options[format]);
            }
        }

        SPONGE.isInitialized = true;
    },
    inject: () => {
        if (SPONGE.isWorkbench) {
            return;
        }
        
        if (Utils.RPGMAKER_NAME === "MV") {
            Scene_Boot.prototype.create = SPONGE_OVERRIDES.MV.create;
            Bitmap.prototype._requestImage = SPONGE_OVERRIDES.MV.requestImage;
            Decrypter.decryptImg = SPONGE_OVERRIDES.MV.decryptImage;
        } else if (Utils.RPGMAKER_NAME === "MZ") {
            Scene_Boot.prototype.create = SPONGE_OVERRIDES.MZ.create;
            Bitmap.prototype._startLoading = SPONGE_OVERRIDES.MZ.startLoading;
            Bitmap.prototype._startDecrypting = SPONGE_OVERRIDES.MZ.startDecrypting;
        } else {
            SPONGE_WORKBENCH.error("INJ_NAME_NOT_FOUND", "Could not resolve the RPG MAKER name.", null);
        }
    }
};

let SPONGE_WORKBENCH = {
    isInitialized: false,
    init: () => {
        if (SPONGE.isNwjs) {
            const gui = require('nw.gui');

            let win = nw.Window.get();
            let x = (window.screen.width / 2) - (1100 / 2);
            let y = (window.screen.height / 2) - (750 / 2);
            win.moveTo(x, y);
            win.resizeTo(1100, 750);
    
            win.on('close', () => {
                gui.App.quit();
            });

            SPONGE_WORKBENCH.isInitialized = true;
        }
    },
    main: () => {
        SPONGE_WORKBENCH.init();

        if (SPONGE_WORKBENCH.isInitialized) {
            let url = "./js/libs/sponge/main.html";
            if (!fs.existsSync(url) && SPONGE.rpgMakerName === "MV") {
                url = path.join("./www", url);
            }
            url += `?workbench=true"`;
            
            window.location.href = url;
        } else {
            alert("Cannot open the workbench in the current environment.");
        }
    },
    error: (type, desc, stacktrace) => {
        SPONGE_WORKBENCH.init();

        if (SPONGE_WORKBENCH.isInitialized) {
            let params = new URLSearchParams();

            if (type !== null && typeof type === "string" && type.length !== 0) {
                params.append("type", encodeURIComponent(type));
            }
            if (desc !== null && typeof desc === "string" && desc.length !== 0) {
                params.append("desc", encodeURIComponent(desc));
            }
            if (stacktrace !== null && typeof stacktrace === "string" && stacktrace.length !== 0) {
                params.append("stacktrace", encodeURIComponent(stacktrace));
            }

            let url = "./js/libs/sponge/error.html";
            if (!fs.existsSync(url) && SPONGE.rpgMakerName === "MV") {
                url = path.join("./www", url);
            }
            url += `?${params.toString()}`;

            window.location.href = url;
        } else {
            alert(`${type}\n${desc}`);
        }
    }
};

let SPONGE_FUNCTIONS = {
    options: {
        avif: {},
        jxl: {},
        png: {},
        webp: {}
    },
    isImage: (arrayBuffer) => {
        if (!arrayBuffer) return null;
        if (arrayBuffer.byteLength < 12) return null;

        const avifSignature = "0.0.0.0.66.74.79.70.61.76.69.66";
        const jxlNcsSignature = "ff.a"; // JXL: Naked code-stream.
        const jxlIbcSignature = "0.0.0.c.4a.58.4c.20.d.a.87.a"; // JXL: ISOBMFF-based container.
        const pngSignature = "89.50.4e.47.d.a.1a.a";
        const webpSignature = "57.45.42.50";

        const header0to2 = Array.from(new Uint8Array(arrayBuffer, 0, 2), x => x.toString(16)).join(".");
        const header0to8 = Array.from(new Uint8Array(arrayBuffer, 0, 8), x => x.toString(16)).join(".");
        const header0to12 = Array.from(new Uint8Array(arrayBuffer, 0, 12), x => x.toString(16)).join(".");
        const header8to12 = Array.from(new Uint8Array(arrayBuffer, 8, 4), x => x.toString(16)).join(".");

        if (header0to12 === avifSignature) {
            return "avif";
        } else if ((header0to2 === jxlNcsSignature) || (header0to12 === jxlIbcSignature)) {
            return "jxl";
        } else if (header0to8 === pngSignature) {
            return "png";
        } else if (header8to12 === webpSignature) {
            return "webp";
        } else {
            return null;
        }
    },
    isSponge: (arrayBuffer) => {
        if (!arrayBuffer) return null;
        if (arrayBuffer.byteLength < 4) return null;

        const signature = "53.58.20.a"; // SX<SP><LF>

        let header = new Uint8Array(arrayBuffer, 0, 4);
        return (Array.from(header, x => x.toString(16)).join(".") === signature);
    },
    readSponge: (arrayBuffer) => {
        if (!arrayBuffer) return null;
        if (!SPONGE_FUNCTIONS.isSponge(arrayBuffer)) return { body: arrayBuffer };

        const view = new Uint8Array(arrayBuffer, 0, 8);
        const versionMajor = view.at(4).toString(10);
        const versionMinor = view.at(5).toString(10);
        const formatMain = view.at(6).toString(16);
        const formatSub = view.at(7).toString(16);
        const bitFlags = Array.from(new Uint8Array(arrayBuffer, 8, 8));
        const body = arrayBuffer.slice(16);

        return { versionMajor: versionMajor, versionMinor: versionMinor, formatMain: formatMain, formatSub: formatSub, bitFlags: bitFlags, body: body};
    },
    writeSponge: (arrayBuffer, format) => {
        if (!arrayBuffer) return null;

        let versionMajor = 0x31;
        let versionMinor = 0x30;
        let formatMain = 0x00;
        let formatSub = 0x00;

        switch (format.toLowerCase()) {
            case "avif":
                formatMain = 0x10;
            case "jxl":
                formatMain = 0x20;
            case "png":
                formatMain = 0x30;
            case "webp":
                formatMain = 0x40;
            default:
                formatMain = 0x00;
        }

        let outBuffer = new ArrayBuffer(arrayBuffer.byteLength + 16);

        let header = new Uint8Array(outBuffer, 0, 16);
        header.set([0x53, 0x58, 0x20, 0x0a, versionMajor, versionMinor, formatMain, formatSub], 0);
        header.fill(0x00, 8, 16);

        let body = new Uint8Array(outBuffer);
        body.set(new Uint8Array(arrayBuffer), 16);

        return outBuffer;
    },
    isEncrypted: (arrayBuffer) => {
        if (!arrayBuffer) return null;
        if (arrayBuffer.byteLength < 5) return null;

        const signature = "52.50.47.4d.56"; // RPGMV

        let header = new Uint8Array(arrayBuffer, 0, 5);
        return (Array.from(header, x => x.toString(16)).join(".") === signature);
    },
    encrypt: (arrayBuffer, encryptionKey) => {
        if (!arrayBuffer) return null;
        
        const outBuffer = new ArrayBuffer(arrayBuffer.byteLength + 16);

        const header = new Uint8Array(outBuffer, 0, 16);
        header.set([0x52,0x50,0x47,0x4d,0x56,0x00,0x00,0x00,0x00,0x03,0x01,0x00,0x00,0x00,0x00,0x00], 0); // Note: RPGMV Standard Header

        const body = new Uint8Array(outBuffer, 16);
        body.set(new Uint8Array(arrayBuffer));

        const key = encryptionKey.match(/.{2}/g);
        for (let i = 0; i < 16; i++) {
            body.fill(body.at(i) ^ parseInt(key[i], 16), i, i+1);
        }

        return outBuffer;
    },
    decrypt: (arrayBuffer, encryptionKey) => {
        if (!arrayBuffer) return null;
        if (!SPONGE_FUNCTIONS.isEncrypted(arrayBuffer)) return arrayBuffer;
        
        const outBuffer = arrayBuffer.slice(16);

        const body = new Uint8Array(outBuffer);

        const key = encryptionKey.match(/.{2}/g);
        for (let i = 0; i < 16; i++) {
            body.fill(body.at(i) ^ parseInt(key[i], 16), i, i+1);
        }

        return outBuffer;
    },
    convert: (arrayBuffer, format, options) => {
        return new Promise((resolve, reject) => {
            try {
                if (format !== "avif" && format !== "png" && format !== "jxl" && format !== "webp") reject();
                
                let image = vips.Image.newFromBuffer(arrayBuffer, "", { access: 1 /* Sequential */ });
                let outBuffer = image.writeToBuffer(`.${format}`, options);
                image.delete();

                image = null;

                resolve(outBuffer);
            } catch (err) {
                reject(err);
            }
        });
    },
    interpret: (format, optionsString) => {
        if (format !== "avif" && format !== "png" && format !== "jxl" && format !== "webp") return null;

        let options = {};

        // Split the options string by ';'.
        const partRegex = /(\w+\=)([^\s]+)/;
        let parts = optionsString.split(';');

        for (const part of parts) {
            if (partRegex.test(part)) {
                let dividerIndex = part.indexOf("=");
                let key = part.slice(0, dividerIndex).trim();
                let value = part.slice(dividerIndex + 1, part.length).trim();

                // Convert the value to each type.
                let valueInt = parseInt(value, 10);
                let valueBool = null;
                if (/^(true|false)$/i.test(value)) {
                    if (value.toLowerCase() === "true") {
                        valueBool = true;
                    } else if (value.toLowerCase() === "false") {
                        valueBool = false;
                    }
                }
                let valueLowerCase = value.toLowerCase();
                let valueUpperCase = value.toUpperCase();

                // Parse options.
                switch (key.toLowerCase()) {
                    case "alpha_q":
                        if (!isNaN(valueInt) && valueInt >= 0 && valueInt <= 100 && format === "webp") {
                            options.alpha_q = valueInt;
                        }
                        break;
                    case "bitdepth":
                        if (!isNaN(valueInt) && (valueInt === 1 || valueInt === 2 || valueInt === 4 || valueInt === 8 || valueInt === 16) && (format === "avif" || format === "png")) {
                            options.bitdepth = valueInt;
                        }
                        break;
                    case "compression":
                        if (!isNaN(valueInt) && valueInt >= 0 && valueInt <= 9 && format === "png") {
                            options.compression = valueInt;
                        }
                        break;
                    case "effort":
                        if (format === "avif") {
                            if (!isNaN(valueInt) && valueInt >= 0 && valueInt <= 9) {
                                options.effort = valueInt;
                            }
                        } else if (format === "jxl") {
                            if (!isNaN(valueInt) && valueInt >= 3 && valueInt <= 9) {
                                options.effort = valueInt;
                            }
                        } else if (format === "png") {
                            if (!isNaN(valueInt) && valueInt >= 1 && valueInt <= 10) {
                                options.effort = valueInt;
                            }
                        } else if (format === "webp") {
                            if (!isNaN(valueInt) && valueInt >= 0 && valueInt <= 6) {
                                options.effort = valueInt;
                            }
                        }
                        break;
                    case "encoder":
                        if (format === "avif") {
                            if (valueLowerCase === "auto") {
                                options.encoder = 0;
                            } else if (valueLowerCase === "aom") {
                                options.encoder = 1;
                            } else if (valueLowerCase === "rav1e") {
                                options.encoder = 2;
                            } else if (valueLowerCase === "svt") {
                                options.encoder = 3;
                            }
                        }
                        break;
                    case "interlace":
                        if (valueBool !== null && format === "png") {
                            options.interlace = valueBool;
                        }
                        break;
                    case "keep":
                        if (valueBool !== null) {
                            options.keep = valueBool;
                        }
                        break;
                    case "lossless":
                        if (valueBool !== null && (format === "avif" || format === "jxl" || format === "webp")) {
                            options.lossless = valueBool;
                        }
                        break;
                    case "preset":
                        if (format === "webp") {
                            if (valueLowerCase === "default") {
                                options.preset = 0;
                            } else if (valueLowerCase === "picture") {
                                options.preset = 1;
                            } else if (valueLowerCase === "photo") {
                                options.preset = 2;
                            } else if (valueLowerCase === "drawing") {
                                options.preset = 3;
                            } else if (valueLowerCase === "icon") {
                                options.preset = 4;
                            } else if (valueLowerCase === "text") {
                                options.preset = 5;
                            }
                        }
                        break;
                    case "q":
                        if (!isNaN(valueInt) && valueInt >= 1 && valueInt <= 100) {
                            options.Q = valueInt;
                        }
                        break;
                    case "subsample_mode":
                        if (format === "avif") {
                            if (valueLowerCase === "auto") {
                                options.subsample_mode = 0;
                            } else if (valueLowerCase === "on") {
                                options.subsample_mode = 1;
                            } else if (valueLowerCase === "off") {
                                options.subsample_mode = 2;
                            }
                        }
                        break;
                    case "smart_subsample":
                        if (valueBool !== null && format === "webp") {
                            options.smart_subsample = valueBool;
                        }
                        break;
                    case "tier":
                        if (!isNaN(valueInt) && valueInt >= 0 && valueInt <= 4 && format === "jxl") {
                            options.tier = valueInt;
                        }
                        break;
                    case "min_size":
                        if (valueBool !== null && format === "webp") {
                            options.min_size = valueBool;
                        }
                        break;
                    case "mixed":
                        if (valueBool !== null && format === "webp") {
                            options.mixed = valueBool;
                        }
                        break;
                    case "near_lossless":
                        if (valueBool !== null && format === "webp") {
                            options.near_lossless = valueBool;
                        }
                        break;
                }
            }
        }

        if (format === "avif") {
            // Note: 1(HEVC), 4(AV1)
            options.compression = 4;
        }

        return options;
    },
    waitForDeps: () => {
        return new Promise((resolve, reject) => {
            const intervalId = setInterval(() => {
                if (typeof vips !== "undefined" && vips !== null && SPONGE.isInitialized) {
                    clearInterval(intervalId);
                    resolve();
                }
            }, 100);
        });
    }
};

let SPONGE_OVERRIDES = {
    MV: {
        // Note: This function overrides 'Scene_Boot.prototype.create'.
        create: function() {
            SPONGE_FUNCTIONS.waitForDeps().then(() => {
                Scene_Base.prototype.create.call(this);
                DataManager.loadDatabase();
                ConfigManager.load();
                this.loadSystemWindowImage();
            });
        },
        // Note: This function overrides 'Bitmap.prototype._requestImage'.
        requestImage: function (url) {
            if(Bitmap._reuseImages.length !== 0){
                this._image = Bitmap._reuseImages.pop();
            }else{
                this._image = new Image();
            }
        
            if (this._decodeAfterRequest && !this._loader) {
                this._loader = ResourceHandler.createLoader(url, this._requestImage.bind(this, url), this._onError.bind(this));
            }
        
            this._image = new Image();
            this._url = url;
            this._loadingState = 'requesting';
        
            // WARN: The flag 'Decrypter.hasEncryptedImages' has been removed. All files pass through the decrypt function.
            if(!Decrypter.checkImgIgnore(url)) {
                this._loadingState = 'decrypting';
                Decrypter.decryptImg(url, this);
            } else {
                this._image.src = url;
        
                this._image.addEventListener('load', this._loadListener = Bitmap.prototype._onLoad.bind(this));
                this._image.addEventListener('error', this._errorListener = this._loader || Bitmap.prototype._onError.bind(this));
            }
        },
        // Note: This function overrides 'Decrypter.decryptImg'.
        decryptImage: function (url, bitmap) {
            url = Decrypter.extToEncryptExt(url);

            var requestFile = new XMLHttpRequest();
            requestFile.open("GET", url);
            requestFile.responseType = "arraybuffer";
            requestFile.send();
        
            requestFile.onload = function () {
                if(requestFile.status < Decrypter._xhrOk) {
                    // Parse the Sponge Exchnage(SX) Container and decode it.   
                    var arrayBuffer = requestFile.response;

                    if (SPONGE_FUNCTIONS.isSponge(arrayBuffer)) {
                        arrayBuffer = SPONGE_FUNCTIONS.readSponge(arrayBuffer).body;
                    }

                    if (SPONGE_FUNCTIONS.isEncrypted(arrayBuffer)) {
                        arrayBuffer = SPONGE_FUNCTIONS.decrypt(arrayBuffer, SPONGE.encryptionKey);
                    }

                    if (SPONGE_FUNCTIONS.isImage(arrayBuffer) === "png") {
                        const blob = new Blob([arrayBuffer], { type: "image/png" });
                        bitmap._image.src = URL.createObjectURL(blob);
                        bitmap._image.addEventListener('load', bitmap._loadListener = Bitmap.prototype._onLoad.bind(bitmap));
                        bitmap._image.addEventListener('error', bitmap._errorListener = bitmap._loader || Bitmap.prototype._onError.bind(bitmap));
                    } else {
                        SPONGE_FUNCTIONS.convert(arrayBuffer, "png", SPONGE_FUNCTIONS.options.png).then((data) => {
                            const blob = new Blob([data], { type: "image/png" });
                            bitmap._image.src = URL.createObjectURL(blob);
                            bitmap._image.addEventListener('load', bitmap._loadListener = Bitmap.prototype._onLoad.bind(bitmap));
                            bitmap._image.addEventListener('error', bitmap._errorListener = bitmap._loader || Bitmap.prototype._onError.bind(bitmap));
                        });
                    }
                }
            };
        
            requestFile.onerror = function () {
                if (bitmap._loader) {
                    bitmap._loader();
                } else {
                    bitmap._onError();
                }
            };
        }
    },
    MZ: {
        // Note: This function overrides 'Scene_Boot.prototype.create'.
        create: function() {
            SPONGE_FUNCTIONS.waitForDeps().then(() => {
                Scene_Base.prototype.create.call(this);
                DataManager.loadDatabase();
                StorageManager.updateForageKeys();
            });
        },
        // Note: This function overrides 'Bitmap.prototype._startLoading'.
        startLoading: function () {
            this._image = new Image();
            this._image.onload = this._onLoad.bind(this);
            this._image.onerror = this._onError.bind(this);
            this._destroyCanvas();
            this._loadingState = "loading";

            // WARN: The flag 'Utils.hasEncryptedImages()' has been removed. All files pass through the decrypt function.
            this._startDecrypting();
        },
        // Note: This function overrides 'Bitmap.prototype._startDecrypting'.
        startDecrypting: function () {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", this._url + "_");
            xhr.responseType = "arraybuffer";
            xhr.onload = () => {
                if (xhr.status < 400) {
                    // Wait for dependencies.
                    SPONGE_FUNCTIONS.waitForObject().then(() => {
                        // Parse the Sponge Exchnage(SX) Container and decode it.   
                        var arrayBuffer = xhr.response;

                        if (SPONGE_FUNCTIONS.isSponge(arrayBuffer)) {
                            arrayBuffer = SPONGE_FUNCTIONS.readSponge(arrayBuffer).body;
                        }
                    
                        if (SPONGE_FUNCTIONS.isEncrypted(arrayBuffer)) {
                            arrayBuffer = SPONGE_FUNCTIONS.decrypt(arrayBuffer, SPONGE.encryptionKey);
                        }
                    
                        if (SPONGE_FUNCTIONS.isImage(arrayBuffer) === "png") {
                            const blob = new Blob([arrayBuffer], { type: "image/png" });
                            this._image.src = URL.createObjectURL(blob);
                        } else {
                            SPONGE_FUNCTIONS.convert(arrayBuffer, "png", SPONGE_FUNCTIONS.options.png).then((data) => {
                                const blob = new Blob([data], { type: "image/png" });
                                this._image.src = URL.createObjectURL(blob);
                            });
                        }
                    });
                } else {
                    this._onError();
                }
            }
            xhr.onerror = this._onError.bind(this);
            xhr.send();
        },
    },
};

let SPONGE_TESTS = {
    diagnoseEnvironment: () => {
        // Error: DIAG_ENV_NODE_NOT_FOUND
        let isNode = typeof process !== 'undefined' && !!process.versions && !!process.versions.node;
        if (!isNode) {
            SPONGE_WORKBENCH.error("DIAG_ENV_NODE_NOT_FOUND", "The JavaScript runtime environment does not appear to be node.js.", null);
            return false;
        }

        // Error: DIAG_ENV_WASM_NOT_SUPPORTED
        let regex = /(?<=[vV])(\d+\.\d+)/;
        let nodeVersion = parseFloat(regex.exec(process.version)[0]);
        if (!isNaN(nodeVersion) && nodeVersion < 16.4) {
            SPONGE_WORKBENCH.error("DIAG_ENV_WASM_NOT_SUPPORTED", "At least version 16.4 of node.js is required to call the WASM final SIMD opcodes.", null);
            return false;
        }

        // Error: DIAG_ENV_WB_NOT_SUPPORTED
        if (!isNaN(nodeVersion) && nodeVersion < 18.0) {
            SPONGE_WORKBENCH.error("DIAG_ENV_WB_NOT_SUPPORTED", "At least version 18.0 of node.js is required to run the Sponge Workbench.", null);
            return false;
        }

        return true;
    },
    diagnoseEngine: () => {
        // Error: DIAG_ENG_RPGMAKER_NOT_FOUND
        let isRMExists = true;

        if (typeof Utils === 'undefined') {
            isRMExists = false;
        }

        if (Utils.RPGMAKER_NAME === null || typeof Utils.RPGMAKER_NAME !== "string" || (typeof Utils.RPGMAKER_NAME === "string" && Utils.RPGMAKER_NAME.length === 0)) {
            isRMExists = false;
        }

        if (Utils.RPGMAKER_VERSION === null || typeof Utils.RPGMAKER_VERSION !== "string" || (typeof Utils.RPGMAKER_VERSION === "string" && Utils.RPGMAKER_VERSION.length === 0)) {
            isRMExists = false;
        }

        if (!isRMExists) {
            SPONGE_WORKBENCH.error("DIAG_ENG_RPGMAKER_NOT_FOUND", "Unable to find an instance of RPG MAKER Engine.", null);
            return false;
        }

        // Error: DIAG_ENG_WASMVIPS_NOT_FOUND
        if (typeof Vips === 'undefined' || Vips === null)  {
            SPONGE_WORKBENCH.error("DIAG_ENG_WASMVIPS_NOT_FOUND", "Unable to find an instance of wasm-vips.", null);
            return false;
        }

        return true;
    },
};
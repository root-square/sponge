/*!-----------------------------------------------------------------------------
 * Copyright (c) handbros(root-square). All rights reserved.
 * Version: 0.4.0(dev)
 * Released under the MIT license
 * https://github.com/root-square/sponge/blob/main/LICENSE
 *-----------------------------------------------------------------------------*/
'use strict';

const fs = require('fs');
const path = require('path');

let vips = null;
(async () => {
    vips = await Vips();
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

    if (e.key === "Pause" || (e.ctrlKey && e.key === "F7")) {
        SPONGE_WORKBENCH.main();
    }
});

let SPONGE = {
    isNwjs: false,
    isWorkbench: false,
    workDirectory: null,
    rpgMakerName: null,
    rpgMakerVersion: null,
    encryptionKey: null,
    init: () => {
        try {
            SPONGE.isNwjs = (typeof require('nw.gui') !== "undefined");
        } catch (err) {
            SPONGE.isNwjs = false;
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

        // Diagnose the current environment.
        if (!SPONGE.isWorkbench) {
            SPONGE_TESTS.diagnoseEnvironment();
            SPONGE_TESTS.diagnoseEngine();
        }
    },
    inject: () => {
        if (SPONGE.isWorkbench) {
            return;
        }
        
        if (Utils.RPGMAKER_NAME === "MV") {
            Bitmap.prototype._requestImage = SPONGE_OVERRIDES.MV.requestImage;
            Decrypter.prototype.decryptImg = SPONGE_OVERRIDES.MV.decryptImage;
        } else if (Utils.RPGMAKER_NAME === "MZ") {
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
            window.location.href = "./js/libs/sponge/main.html?workbench=true";
        } else {
            alert("Cannot open the workbench in the current environment.");
        }
    },
    error: (type, desc, stacktrace, modifier = null) => {
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
    
            window.location.href = path.resolve(modifier === null ? "" : modifier, `./js/libs/sponge/error.html?${params.toString()}`);
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
        const avifSignature = "0.0.0.0.66.74.79.70.61.76.69.66";
        const jxlSignature = "0.0.0.c.4a.58.4c.20.d.a.87.a";
        const pngSignature = "89.50.4e.47.d.a.1a.a";
        const webpSignature = "57.45.42.50";

        const header0to8 = Array.from(new Uint8Array(arrayBuffer, 0, 8), x => x.toString(16)).join(".");
        const header0to12 = Array.from(new Uint8Array(arrayBuffer, 0, 12), x => x.toString(16)).join(".");
        const header8to12 = Array.from(new Uint8Array(arrayBuffer, 8, 4), x => x.toString(16)).join(".");

        if (header0to12 === avifSignature) {
            return "avif";
        } else if (header0to12 === jxlSignature) {
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

        const signature = "53.58.20.a"; // SX<SP><LF>

        let header = new Uint8Array(arrayBuffer, 0, 4);
        return (Array.from(header, x => x.toString(16)).join(".") === signature);
    },
    readSponge: (arrayBuffer) => {
        if (!arrayBuffer) return null;
        if (!SPONGE_FUNCTIONS.isSponge(arrayBuffer)) return { body: arrayBuffer };

        const versionMajor = new Uint8Array(arrayBuffer, 4, 1);
        const versionMinor = new Uint8Array(arrayBuffer, 5, 1);
        const formatMain = new Uint8Array(arrayBuffer, 6, 1);
        const formatSub = new Uint8Array(arrayBuffer, 7, 1);
        const bitFlags = new Uint8Array(arrayBuffer, 8, 8);
        const body = source.slice(16);

        return { versionMajor: versionMajor, versionMinor: versionMinor, formatMain: formatMain, formatSub: formatSub, bitFlags: bitFlags, body: body};
    },
    writeSponge: (arrayBuffer, format) => {
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

        const view = new DataView(body);
        const key = encryptionKey.match(/.{2}/g);
        for (let i = 0; i < 16; i++) {
            view.setUint8(i, view.getUint8(i) ^ parseInt(key[i], 16));
        }

        return outBuffer;
    },
    decrypt: (arrayBuffer, encryptionKey) => {
        if (!arrayBuffer) return null;
        if (!SPONGE_FUNCTIONS.isEncrypted(arrayBuffer)) return arrayBuffer;
        
        const body = arrayBuffer.slice(16);
        const view = new DataView(body);
        const key = encryptionKey.match(/.{2}/g);
        for (let i = 0; i < 16; i++) {
            view.setUint8(i, view.getUint8(i) ^ parseInt(key[i], 16));
        }
        return body;
    },
    interpret: (format, optionsString) => {
        format = format.toLowerCase();
        if (format !== "avif" && format !== "png" && format !== "jxl" && format !== "webp") return null;

        let options = {};

        // Split the options string by ';'.
        const partRegex = /(\w+\=)([^\s]+)/;
        let parts = optionsString.split(';');

        for (const part of parts) {
            if (partRegex.test(part)) {
                let dividerIndex = part.indexOf("=");
                let key = part.slice(0, dividerIndex);
                let value = part.slice(dividerIndex + 1, part.length - 1);

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
                    case "speed":
                        if (!isNaN(valueInt) && valueInt >= 0 && valueInt <= 9 && format === "avif") {
                            options.speed = valueInt;
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
    convert: async (arrayBuffer, format, options) => {
        format = format.toLowerCase();
        if (format !== "avif" && format !== "png" && format !== "jxl" && format !== "webp") return null;

        let image = vips.Image.newFromBuffer(arrayBuffer);
        let outBuffer = image.writeToBuffer(`.${format}`, options);
        return outBuffer;
    }
};

let SPONGE_OVERRIDES = {
    MV: {
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
            url = this.extToEncryptExt(url);

            var requestFile = new XMLHttpRequest();
            requestFile.open("GET", url);
            requestFile.responseType = "arraybuffer";
            requestFile.send();
        
            requestFile.onload = function () {
                if(this.status < Decrypter._xhrOk) {
                    var arrayBuffer = null; 
                    
                    if (Decrypter.hasEncryptedImages) {
                        arrayBuffer = Decrypter.decryptArrayBuffer(requestFile.response);   
                    } else {
                        arrayBuffer = requestFile.response;
                    }

                    // Parse the Sponge Exchnage(SX) Container and decode it.                  
                    if (!SPONGE_FUNCTIONS.isSponge(arrayBuffer)) {
                        bitmap._image.src = Decrypter.createBlobUrl(arrayBuffer);
                        bitmap._image.addEventListener('load', bitmap._loadListener = Bitmap.prototype._onLoad.bind(bitmap));
                        bitmap._image.addEventListener('error', bitmap._errorListener = bitmap._loader || Bitmap.prototype._onError.bind(bitmap));
                    } else {
                        var body = SPONGE_FUNCTIONS.readSponge(arrayBuffer).body;

                        SPONGE_FUNCTIONS.convert(body, "png", SPONGE_FUNCTIONS.options.png).then((data) => {
                            bitmap._image.src = Decrypter.createBlobUrl(data);
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
                    let arrayBuffer = null; 
                    
                    if (Utils.hasEncryptedImages) {
                        arrayBuffer = Utils.decryptArrayBuffer(xhr.response);
                    } else {
                        arrayBuffer = requestFile.response;
                    }

                    // Parse the Sponge Exchnage(SX) Container and decode it.
                    if (!SPONGE_FUNCTIONS.isSponge(arrayBuffer)) {
                        const blob = new Blob([arrayBuffer]);
                        this._image.src = URL.createObjectURL(blob);
                    } else {
                        var body = SPONGE_FUNCTIONS.readSponge(arrayBuffer).body;
                        
                        SPONGE_FUNCTIONS.convert(body, "png", SPONGE_FUNCTIONS.options.png).then((data) => {
                            const blob = new Blob([data]);
                            this._image.src = URL.createObjectURL(blob);
                        });
                    }
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
        if (!isNode)
            SPONGE_WORKBENCH.error("DIAG_ENV_NODE_NOT_FOUND", "The JavaScript runtime environment does not appear to be node.js.", null);

        // Error: DIAG_ENV_WASM_NOT_SUPPORTED
        let regex = /(?<=[vV])(\d+\.\d+)/;
        let nodeVersion = parseFloat(regex.exec(process.version));
        if (!isNaN(nodeVersion) && nodeVersion < 16.4)
            SPONGE_WORKBENCH.error("DIAG_ENV_WASM_NOT_SUPPORTED", "At least version 16.4 of node.js is required to call the WASM final SIMD opcodes.", null);
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

        if (!isRMExists)
            SPONGE_WORKBENCH.error("DIAG_ENG_RPGMAKER_NOT_FOUND", "Unable to find an instance of RPG MAKER Engine.", null);

        // Error: DIAG_ENG_WASMVIPS_NOT_FOUND
        if (typeof Vips === 'undefined') 
            SPONGE_WORKBENCH.error("DIAG_ENG_WASMVIPS_NOT_FOUND", "Unable to find an instance of wasm-vips.", null);
    },
};
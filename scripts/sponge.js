/*!-----------------------------------------------------------------------------
 * Copyright (c) handbros(root-square). All rights reserved.
 * Version: 0.2.1(dev)
 * Released under the MIT license
 * https://github.com/root-square/sponge/blob/main/LICENSE
 *-----------------------------------------------------------------------------*/
'use strict';

const fs = require('fs');
const path = require('path');
const gui = require('nw.gui');

window.addEventListener("load", () => {
    SPONGE.init();
    SPONGE.inject();
});

window.addEventListener("keydown", (e) => {
    if (e.key == "Pause") {
        SPONGE_WORKBENCH.main();
    }
});

let SPONGE = {
    packageJson: "",
    workDirectory: "",
    init: () => {
        // Parse the actual work directory.
        let pkgPath = path.resolve(process.cwd(), "package.json");

        if (fs.existsSync(pkgPath)) {
            let pkgJson = JSON.parse(fs.readFileSync(pkgPath));
            SPONGE.packageJson = pkgPath;
            SPONGE.workDirectory = path.dirname(path.resolve(process.cwd(), pkgJson.main));
        }

        // Diagnose the current environment.
        SPONGE_TESTS.diagnoseEnvironment();
        SPONGE_TESTS.diagnoseEngine();
    },
    inject: () => {
        if (Utils.RPGMAKER_NAME === "MV") {
            Bitmap.prototype._requestImage = SPONGE_OVERRIDES.MV.requestImage;
            Decrypter.decryptImg = SPONGE_OVERRIDES.MV.decryptImage;
        } else if (Utils.RPGMAKER_NAME === "MZ") {
            Bitmap.prototype._startLoading = SPONGE_OVERRIDES.MZ.startLoading;
            Bitmap.prototype._startDecrypting = SPONGE_OVERRIDES.MZ.startDecrypting;
        } else {
            SPONGE_WORKBENCH.error("INJ_NAME_NOT_FOUND", "Could not resolve the RPG MAKER name.", null);
        }
    }
};

let SPONGE_WORKBENCH = {
    init: () => {
        let win = nw.Window.get();
        let x = (window.screen.width / 2) - (1100 / 2);
        let y = (window.screen.height / 2) - (750 / 2);
        win.moveTo(x, y);
        win.resizeTo(1100, 750);

        win.on('close', () => {
            gui.App.quit();
        });
    },
    main: () => {
        SPONGE_WORKBENCH.init();

        window.location.href="./js/libs/sponge/main.html";
    },
    about: (referer) => {
        SPONGE_WORKBENCH.init();

        let params = new URLSearchParams();

        let settingsPath = path.resolve(workDirectory, "js/libs/sponge.json");
        if (fs.existsSync(settingsPath)) {
            let settingsJson = JSON.parse(fs.readFileSync(settingsPath));
            params.append("mode", settingsJson.mode);
            params.append("version", settingsJson.version);
        }

        if (referer !== null && typeof referer === "string" && referer.length !== 0) {
            params.append("referer", encodeURIComponent(referer));
        }

        window.location.href = `./js/libs/sponge/about.html?${params.toString()}`;
    },
    error: (type, desc, stacktrace) => {
        SPONGE_WORKBENCH.init();

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

        window.location.href = `./js/libs/sponge/error.html?${params.toString()}`;
    }
};

let SPONGE_FUNCTIONS = {
    options: {
        avif: {},
        heif: {},
        jxl: {},
        png: {},
        webp: {}
    },
    isSponge: (arrayBuffer) => {
        if (!arrayBuffer) return null;

        const signature = "53.58.20.0a";

        let header = new Uint8Array(arrayBuffer, 0, 4);
        return (Array.from(header, x => x.toString(16)).join(".") !== signature);
    },
    readSponge: (arrayBuffer) => {
        if (!arrayBuffer) return null;
        if (!isSponge(arrayBuffer)) return { body: arrayBuffer };

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
                formatMain = 0x01;
            case "heif":
                formatMain = 0x02;
            case "jxl":
                formatMain = 0x03;
            case "png":
                formatMain = 0x04;
            case "webp":
                formatMain = 0x05;
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
    interpret: (format, optionsString) => {
        format = format.toLowerCase();
        if (format !== "avif" && format !== "heif" && format !== "png" && format !== "jxl" && format !== "webp") return null;

        let options = {};

        const partRegex = /(\w+\=)([^\s]+)/;
        let parts = optionsString.split(';');

        for (const part of parts) {
            if (partRegex.test(part)) {
                let dividerIndex = part.indexOf("=");
                let key = part.slice(0, dividerIndex);
                let value = part.slice(dividerIndex + 1, part.length - 1);

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
                let valueUpperCase = value.toLowerCase();

                switch (key.toLowerCase()) {
                    case "alpha_q":
                        if (!isNaN(valueInt) && valueInt >= 0 && valueInt <= 100 && format === "webp") {
                            options.alpha_q = valueInt;
                        }
                        break;
                    case "bitdepth":
                        if (!isNaN(valueInt) && valueInt >= 1 && valueInt <= 16 && (format === "avif" || format === "heif" || format === "png")) {
                            options.bitdepth = valueInt;
                        }
                        break;
                    case "compression":
                        if (!isNaN(valueInt) && valueInt >= 0 && valueInt <= 9 && format === "png") {
                            options.compression = valueInt;
                        }
                        break;
                    case "effort":
                        if (format === "avif" || format === "heif") {
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
                        if (format === "avif" || format === "heif") {
                            if (valueLowerCase === "auto") {
                                options.encoder = 0;
                            } else if (valueLowerCase === "aom") {
                                options.encoder = 1;
                            } else if (valueLowerCase === "rav1e") {
                                options.encoder = 2;
                            } else if (valueLowerCase === "svt") {
                                options.encoder = 3;
                            } else if (valueLowerCase === "x265") {
                                options.encoder = 4;
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
                        if (valueBool !== null && (format === "avif" || format === "heif" || format === "jxl" || format === "webp")) {
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
                        if (format === "avif" || format === "heif") {
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

        if (format === "avif" || format === "heif") {
            // Note: 1(HEVC), 4(AV1)
            options.compression = (format === "heif") ? 1 : 4;
        }

        return options;
    },
    convert: async (arrayBuffer, format, options) => {
        format = format.toLowerCase();
        if (format !== "avif" && format !== "heif" && format !== "png" && format !== "jxl" && format !== "webp") return null;

        const vips = await Vips(); 

        let image = vips.Image.newFromMemory(arrayBuffer);
        let outBuffer = image.writeToBuffer(`.${format}`, options);
        return outBuffer;
    }
};

let SPONGE_OVERRIDES = {
    MV: {
        // Note: This function overrides 'Bitmap.prototype._requestImage'.
        requestImage: (url) => {
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
        decryptImage: (url, bitmap) => {
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
        startLoading: () => {
            this._image = new Image();
            this._image.onload = this._onLoad.bind(this);
            this._image.onerror = this._onError.bind(this);
            this._destroyCanvas();
            this._loadingState = "loading";

            // WARN: The flag 'Utils.hasEncryptedImages()' has been removed. All files pass through the decrypt function.
            this._startDecrypting();
        },
        // Note: This function overrides 'Bitmap.prototype._startDecrypting'.
        startDecrypting: () => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", this._url + "_");
            xhr.responseType = "arraybuffer";
            xhr.onload = () => {
                if (xhr.status < 400) {
                    let arrayBuffer = null; 
                    
                    if (Decrypter.hasEncryptedImages) {
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
        let regex = /^v(\d+\.\d+)/;
        let nodeVersion = parseFloat(regex.exec(process.version));
        if (nodeVersion < 16.4)
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
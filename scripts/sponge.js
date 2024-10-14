/*!-----------------------------------------------------------------------------
 * Copyright (c) handbros(root-square). All rights reserved.
 * Version: 0.2.0(dev)
 * Released under the MIT license
 * https://github.com/root-square/sponge/blob/main/LICENSE
 *-----------------------------------------------------------------------------*/
'use strict';

window.addEventListener("load", () => {

});

var SPONGE = {
    init: () => {

    },
    inject: () => {

    },
};

var SPONGE_OVERRIDES = {
    MV: {
        // Note: This function overrides 'Bitmap.prototype._requestImage'.
        load: (url) => {
            if (Bitmap._reuseImages.length !== 0) {
                this._image = Bitmap._reuseImages.pop();
            } else {
                this._image = new Image();
            }
        
            if (this._decodeAfterRequest && !this._loader) {
                this._loader = ResourceHandler.createLoader(url, this._requestImage.bind(this, url), this._onError.bind(this));
            }
        
            this._image = new Image();
            this._url = url;
            this._loadingState = 'requesting';
        
            // Create an avif file path.
            var avifUrl = url.substr(0, url.lastIndexOf(".")) + '.avif';
            var avifPath = decodeURIComponent(path.resolve(Bitmap.prototype._mainDirectory, avifUrl)); // Decode the avif path to check its existence.
        
            if (IS_DEV_MODE) {
                console.log('avifPath : ' + avifPath + ', isExist : ' + fs.existsSync(avifPath));
            }
        
            if (fs.existsSync(avifPath) /* If the avif file exists... */) {
                    this._loadingState = 'decrypting';
                    this._url = avifUrl;
                    ImageProcessor.convertAvifToPng(avifPath, this);
                } else if (!Decrypter.checkImgIgnore(url) && Decrypter.hasEncryptedImages) {
                this._loadingState = 'decrypting';
                Decrypter.decryptImg(url, this);
            } else {
                this._image.src = url;
        
                this._image.addEventListener('load', this._loadListener = Bitmap.prototype._onLoad.bind(this));
                this._image.addEventListener('error', this._errorListener = this._loader || Bitmap.prototype._onError.bind(this));
            }
        
        },
        decrypt: () => {

        },
    },
    MZ: {
        // Note: This function overrides 'Bitmap.prototype._startLoading'.
        load: () => {
            this._image = new Image();
            this._image.onload = this._onLoad.bind(this);
            this._image.onerror = this._onError.bind(this);
            this._destroyCanvas();
            this._loadingState = "loading";
    
            // Create an avif file path.
            let avifUrl = this._url.substr(0, this._url.lastIndexOf(".")) + '.avif';
            let avifPath = decodeURIComponent(path.resolve(Bitmap.prototype._mainDirectory, avifUrl)); // Decode the avif path to check its existence.
    
            if (IS_DEV_MODE) {
                console.log(`avifPath : ${avifPath}, isExist : ${fs.existsSync(avifPath)}`);
            }
    
            if (fs.existsSync(avifPath) /* If the avif file exists... */) {
                ImageProcessor.convertAvifToPng(avifPath, this);
            } else if (Utils.hasEncryptedImages()) {
                this._startDecrypting();
            } else {
                this._image.src = this._url;
            }
        },
        decrypt: () => {

        },
    },
};

var SPONGE_TESTS = {
    diagnoseEnvironment: () => {
        // Error: DIAG_ENV_NODE_NOT_FOUND
        var isNode = typeof process !== 'undefined' && !!process.versions && !!process.versions.node;
        if (!isNode) return [false, "DIAG_ENV_NODE_NOT_FOUND", "The JavaScript runtime environment does not appear to be node.js."];

        // Error: DIAG_ENV_WASM_NOT_SUPPORTED
        var regex = /^v(\d+\.\d+)/;
        var nodeVersion = parseFloat(regex.exec(process.version));
        if (nodeVersion < 16.4) return [false, "DIAG_ENV_WASM_NOT_SUPPORTED", "At least version 16.4 of node.js is required to call the WASM final SIMD opcodes."];

        return [true, "DIAG_ENV_SUCCEEDED", "The operation successfully completed."];
    },
    diagnoseEngine: () => {
        // Error: DIAG_ENG_RPGMAKER_NOT_FOUND
        var isNode = typeof Utils !== 'undefined' && !!Utils.RPGMAKER_NAME && !!process.RPGMAKER_VERSION;
        if (!isNode) return [false, "DIAG_ENG_RPGMAKER_NOT_FOUND", "Unable to find an instance of RPG MAKER Engine."];

        return [true, "DIAG_ENG_SUCCEEDED", "The operation successfully completed."];
    },
};
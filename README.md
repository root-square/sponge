# Sponge
A dynamic image format extension library for RPG Maker MV/MZ.

## Requirements
| Name      | Minimum Version |
| :-------: | :-------------: |
| Node.js   | v18.0.0         |
| NW.js     | v0.64.1         |
| wasm-vips | v0.0.10         |

## Installation
### Auto
Download the [Sponge Patch Assistant](https://github.com/root-square/sponge/blob/main/tools/sponge.ps1) and run it in the directory where the game executable file (Game.exe) is located.
```pwsh
Set-ExecutionPolicy Unrestricted

./sponge.ps1 -m [install/uninstall] -v [version] -s [version]
# or
./sponge.ps1 -mode [install/uninstall] -vipsVersion [version] -spongeVersion [version]
```

### Manual


## Usage
> [!WARNING]
> This library brings irreversible changes to your game resources. Make sure you back up the original files before using it.

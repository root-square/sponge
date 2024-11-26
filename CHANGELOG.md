# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- Title Format : 'Unreleased' or '[VERSION] - DATE(yyyy-MM-dd)' -->
<!-- Section Types : Added, Changed, Deprecated, Removed, Fixed, Security -->

<!--
## [Unreleased]

### Added
- (desc)
-->

## [0.7.1] - 2024-11-26
### Fixed
- Fix path mismatches.
- Fix a typo on page reloader.

## [0.7.0] - 2024-11-24

### Added
- Add the mode seperation logic.
- Add a waiter function to wait for dependencies.
- Add additional default ignores for MV.

### Fixed
- Fix the createObjectURL error.
- Fix the Workbench HTML path mismathcing.
- Fix memory leaks in the wasm-vips.

## [0.6.0] - 2024-11-19

### Added
- Add options loader to SPONGE.
- Add core tasks(encode, decode, inspect).
- Add a result modal to the Workbench.

### Changed
- Change the injection target of 'decryptImage'.

### Removed
- Remove the 'RusAsAdministrator' param from SPA.

### Fixed
- Fix bugs in override functions.
- Fix bugs in the data size calculation logic of the Workbench.

## [0.5.0] - 2024-11-08

### Added
- Implement viewer logics and interations.
- Add RMMV standard encryption functions.
- Add RMMV default ignores to the ignore list.
- Apply options interpreter to workbench.

### Changed
- Optimize the default options.

### Removed
- Remove the HEIF support.
- Remove the metadata tab from viewer.

### Fixed
- Change to encoding without the BOM(for package.json).

## [0.4.0] - 2024-11-04

### Added
- Add Sponge Patch Assistant(based on pwsh)

## [0.3.2] - 2024-10-26

### Added
- Add input-nav-path interactions.
- Add engine data getter functions.
- Add detailed summaries.

### Changed
- Change 'isSilentMode' to 'isWorkbench'.

## [0.3.1] - 2024-10-25

### Added
- Add file I/O functions.
- Add Sponge Exchange Format(SX) I/O functions.
- Add image format converter, and validator.
- Add override function injector.
- Add default settings to 'sponge.json'.
- (WORKBENCH) Add options reader/writer.
- (WORKBENCH) Add file navigation system(linear history based).

### Changed
- Make the 'sponge.js' interoperable.
- Change override methods to function.

### Fixed
- Fix the data transfer logic between Workbench UIs.

## [0.3.0] - 2024-10-17

### Added
- Apply diagnostics functions.

### Removed
- Remove a deprecated library: virtualized-list.

## [0.2.1] - 2024-10-17

### Added
- Implement Workbench UI(main, about, error).
- Apply virtualized list to the file explorer.

### Removed
- Remove wunderbaum library(file explorer: treeview → listview).

## [0.2.0] - 2024-10-14

### Added
- Add diagnostics functions.
- Add shell script base.

## [0.1.0] - 2024-10-14

### Added
- Build the initial project layout.
- Add the package information.
- Add core dependencies.
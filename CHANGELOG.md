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
# Changelog

All notable changes to LaserTrace Pro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-XX-XX

### Added
- Native desktop application using Tauri (Rust + React)
- 7 professional artistic filters (oil painting, watercolor, pencil sketch, charcoal, classical engraving, stippling, unsharp mask)
- 5 advanced dithering algorithms (Floyd-Steinberg, Atkinson, Stucki, Jarvis-Judice-Ninke, ordered)
- Enhanced halftone system with 5 dot shapes (circle, square, diamond, line, cross)
- 40+ one-click filter presets organized by category
- Native serial communication for laser control
- File I/O: Save/load projects (.ltp format)
- G-code export functionality
- Material presets for common materials (plywood, acrylic, leather, copper, slate)
- Vector path extraction from images
- Professional UI with collapsible sections
- Dark theme with emerald accents

### Changed
- Migrated from Web Serial API to native Rust serial communication
- Upgraded from web application to native desktop app
- Improved reliability and performance

### Technical
- Built with Tauri 1.8, React 19, TypeScript 5.8, Rust 1.60
- Cross-platform support: Windows 10+, macOS 10.15+, Linux
- Installers: MSI (Windows), DMG (macOS), AppImage/DEB (Linux)

## [Unreleased]

### Planned
- Auto-updater for new releases
- Cloud sync for projects
- Extended material library
- Advanced path optimization
- Multi-language support

---

## Version History Format

### [Version] - YYYY-MM-DD

#### Added
- New features

#### Changed  
- Changes to existing functionality

#### Deprecated
- Features planned for removal

#### Removed
- Removed features

#### Fixed
- Bug fixes

#### Security
- Security updates

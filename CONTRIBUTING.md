# Contributing to YouTube Shorts Limiter

Thank you for your interest in contributing to YouTube Shorts Limiter! This document provides guidelines for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature

```bash
git clone https://github.com/yourusername/youtube-shorts-limiter.git
cd youtube-shorts-limiter
git checkout -b feature/your-feature-name
```

## Development Setup

1. Make sure you have the required tools:
   - Firefox browser
   - Bash shell (for build script)
   - ffmpeg (optional, for icon generation)

2. Make changes to files in the `src/` directory

3. Test your changes:
   ```bash
   # Build the extension
   ./build.sh
   
   # Test in Firefox using about:debugging
   # Load the src/manifest.json file
   ```

## Code Style

- Use consistent indentation (2 spaces)
- Follow JavaScript best practices
- Add comments for complex logic
- Keep functions small and focused

## File Structure

```
src/
├── images/          # Extension icons
├── manifest.json    # Extension manifest
├── content.js       # Content script for YouTube pages
├── background.js    # Background script
├── popup.html       # Popup interface
└── popup.js         # Popup logic
```

## Testing

Before submitting a pull request:

1. Test the extension in Firefox
2. Verify that Shorts tracking works correctly
3. Check that the popup interface functions properly
4. Ensure the blocking screen appears when limit is reached

## Submitting Changes

1. Commit your changes with a descriptive message:
   ```bash
   git commit -m "Add feature: description of what you added"
   ```

2. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

3. Create a Pull Request on GitHub

## Pull Request Guidelines

- Provide a clear description of the changes
- Include screenshots if UI changes are made
- Test the extension thoroughly before submitting
- Follow the existing code style

## Issues

When reporting issues:

1. Use the issue template if available
2. Describe the problem clearly
3. Include steps to reproduce
4. Mention your Firefox version and OS

## Questions?

If you have questions about contributing, feel free to open an issue or contact the maintainers.

Thank you for contributing! 🎉 
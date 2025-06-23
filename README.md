# YouTube Shorts Limiter

A Firefox extension that limits YouTube Shorts viewing to 5 videos per day.

## Features

- 🎯 Tracks the number of YouTube Shorts watched
- 🚫 Blocks Shorts after reaching the limit (default: 5 videos)
- 📊 Beautiful interface with progress bar
- ⚙️ Configurable viewing limit
- 🔄 Automatic counter reset each day
- 🎛️ Ability to enable/disable the extension

## Installation

### Temporary installation (for development)

1. Open Firefox
2. Go to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the `src/manifest.json` file from the extension folder

## Development

### Project Structure

```
youtube-shorts-limiter/
├── src/
│   ├── images/
│   │   ├── icon.png
│   │   ├── icon-16.png
│   │   ├── icon-32.png
│   │   ├── icon-48.png
│   │   ├── icon-96.png
│   │   └── icon-128.png
│   ├── manifest.json
│   ├── content.js
│   ├── background.js
│   ├── popup.html
│   └── popup.js
├── build.sh
├── package.json
├── README.md
└── .gitignore
```

### Building

To build the extension:

```bash
# Make build script executable
chmod +x build.sh

# Build the extension
./build.sh
```

Or using npm:

```bash
npm run build
```

### Development Setup

1. Clone the repository
2. Make changes to files in `src/`
3. Run `./build.sh` to create a new package
4. Test in Firefox using `about:debugging`

## Usage

1. After installing the extension, go to YouTube
2. Start watching Shorts
3. The extension will automatically track views
4. After 5 views (or the set limit), Shorts will be blocked
5. Click the extension icon in the toolbar to manage settings

## Settings

In the extension popup, you can:

- Change the daily Shorts viewing limit
- Reset the view counter
- Enable/disable the extension
- View current progress

## Extension Files

- `src/manifest.json` - extension manifest
- `src/content.js` - main script for tracking Shorts
- `src/background.js` - background script
- `src/popup.html` - popup interface
- `src/popup.js` - popup logic
- `src/images/` - extension icons

## How it works

1. The extension tracks YouTube page URLs
2. When Shorts are detected (URL contains `/shorts/` or vertical video),
   tracking begins
3. After 10 seconds of viewing, the counter increases
4. When the limit is reached, a blocking screen is shown
5. The counter resets each day at midnight

## Technical Details

- Uses WebExtension API
- Stores data in browser's local storage
- Tracks URL changes for SPA compatibility
- Automatically cleans old data (older than 7 days)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License

## Support

If you have questions or suggestions, create an issue in the project repository.

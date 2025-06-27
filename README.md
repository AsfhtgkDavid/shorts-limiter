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

### Stable version (recommended)

You can install the stable version of the extension directly from the Mozilla Add-ons store:

- [Shorts Limiter on Firefox Add-ons](https://addons.mozilla.org/addon/shorts-limiter/)

Just click "Add to Firefox" and follow the instructions.

#### Chrome and Firefox (signed .xpi for Firefox)

In the [Releases](https://github.com/AsfhtgkDavid/shorts-limiter/releases) section of the repository, you will find ready-made extension packages:

- **For Firefox:** A signed `.xpi` file is available, which can be installed directly via `about:addons` or simply by dragging it into the Firefox browser window.
- **For Chrome:** Download the `.zip` archive, extract it, and load the folder as an unpacked extension via `chrome://extensions` (enable Developer mode).

### Temporary installation (for development)

1. Open Firefox
2. Go to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the `src/manifest.json` file from the extension folder

## Development

### Building

Make sure you have Deno installed before starting building.

To build the extension yourself, there are two scripts available:
- `build_firefox.sh` — builds a package for Firefox
- `build_chrome.sh` — builds a package for Chrome

You can run these scripts from the project root to generate the corresponding extension packages:

```bash
# For Firefox
./build_firefox.sh

# For Chrome
./build_chrome.sh
```

### Development Setup

1. Clone the repository
2. Make changes to files in `src/`
3. Install Deno
4. Run `./build.sh` to create a new package
5. Test in Firefox using `about:debugging` or in Chromium based browsers using
   `chrome://extensions`

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

- `manifest.json` - extension manifest
- `content.ts` - main script for tracking Shorts
- `background.ts` - background script
- `popup.html` - popup interface
- `popup.ts` - popup logic
- `images/` - extension icons

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
3. Commit your changes (follow conventional commit naming)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License

## Support

If you have questions or suggestions, create an issue in the project repository.

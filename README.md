# Obsidian Standalone Markdown Exporter

An Obsidian plugin that exports the active Markdown note with all local images embedded as Base64 strings. This allows you to create a single, fully standalone `.md` file that you can easily share with others without losing any of your local image attachments.

## Features

- **Base64 Image Embedding:** Scans your active note for Obsidian image links (e.g., `![[image.png]]`) and converts them into standard Markdown data URIs.
- **Non-Destructive:** Generates a duplicate file appended with `- Standalone.md` in the same directory, leaving your original note and vault structure completely untouched.
- **Offline Sharing:** Perfect for exporting notes to external wikis, sending via email, or sharing with people who don't use Obsidian, while ensuring all images render correctly.

## Installation

### Manual Installation
1. Go to the `.obsidian/plugins/` directory inside your vault. (You may need to enable hidden files in your OS to see the `.obsidian` folder).
2. Create a new folder named `base64-image-embedder`.
3. Place the `main.js` and `manifest.json` files into this new folder.
4. Open Obsidian and go to **Settings > Community plugins**.
5. Disable **Restricted mode** if it is currently enabled.
6. Refresh the installed plugins list and toggle on **Standalone Markdown Exporter**.

## Usage

1. Open the note you want to export in Obsidian.
2. Open the Command Palette (`Cmd/Ctrl + P`).
3. Search for and select **"Export current file with embedded Base64 images"**.
4. A notification will appear detailing how many images were processed, and a new file (e.g., `YourNote - Standalone.md`) will be generated alongside your current file.

## Local Development

If you want to modify the code or build the plugin yourself:

1. Clone this repository.
2. Run `npm install` to install the dependencies (the Obsidian API).
3. To compile the TypeScript file into JavaScript, run:
   ```bash
   npx esbuild main.ts --bundle --format=cjs --external:obsidian --outfile=main.js
   ```
4. Copy the newly built `main.js` and the `manifest.json` into your Obsidian vault's plugin directory to test your changes.
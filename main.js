var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => StandaloneMarkdownPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var StandaloneMarkdownPlugin = class extends import_obsidian.Plugin {
  async onload() {
    this.addCommand({
      id: "export-standalone-md",
      name: "Export current file with embedded Base64 images",
      callback: () => this.exportWithImages()
    });
  }
  async exportWithImages() {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new import_obsidian.Notice("No active file to export.");
      return;
    }
    new import_obsidian.Notice("Processing images...");
    let content = await this.app.vault.read(activeFile);
    const wikilinkRegex = /!\[\[([^\]]+)\]\]/g;
    let match;
    const matches = [];
    while ((match = wikilinkRegex.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],
        fileName: match[1].split("|")[0]
        // Drop alias/sizing if present
      });
    }
    let replacedCount = 0;
    for (const m of matches) {
      const imageFile = this.app.metadataCache.getFirstLinkpathDest(m.fileName, activeFile.path);
      if (imageFile instanceof import_obsidian.TFile) {
        const binary = await this.app.vault.readBinary(imageFile);
        const base64 = (0, import_obsidian.arrayBufferToBase64)(binary);
        const extension = imageFile.extension.toLowerCase();
        const mimeType = extension === "jpg" ? "image/jpeg" : `image/${extension}`;
        const dataUri = `![${imageFile.name}](data:${mimeType};base64,${base64})`;
        content = content.replace(m.fullMatch, dataUri);
        replacedCount++;
      }
    }
    const parentPath = activeFile.parent?.path === "/" ? "" : activeFile.parent?.path + "/";
    const newFileName = `${parentPath}${activeFile.basename} - Standalone.md`;
    try {
      const existingFile = this.app.vault.getAbstractFileByPath(newFileName);
      if (existingFile instanceof import_obsidian.TFile) {
        await this.app.vault.modify(existingFile, content);
      } else {
        await this.app.vault.create(newFileName, content);
      }
      new import_obsidian.Notice(`Exported! Embedded ${replacedCount} images.`);
    } catch (error) {
      console.error(error);
      new import_obsidian.Notice("Error creating the standalone file.");
    }
  }
};

import { Plugin, Notice, TFile, arrayBufferToBase64 } from 'obsidian';

export default class StandaloneMarkdownPlugin extends Plugin {
    async onload() {
        this.addCommand({
            id: 'export-standalone-md',
            name: 'Export current file with embedded Base64 images',
            callback: () => this.exportWithImages()
        });
    }

    async exportWithImages() {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            new Notice('No active file to export.');
            return;
        }

        new Notice('Processing images...');
        let content = await this.app.vault.read(activeFile);
        
        // Regex to match Obsidian's wikilink image syntax: ![[image.png]] or ![[image.png|alt]]
        const wikilinkRegex = /!\[\[([^\]]+)\]\]/g;
        
        let match;
        const matches = [];
        
        // Collect all matches first to avoid async string replacement issues
        while ((match = wikilinkRegex.exec(content)) !== null) {
            matches.push({
                fullMatch: match[0],
                fileName: match[1].split('|')[0] // Drop alias/sizing if present
            });
        }

        let replacedCount = 0;

        for (const m of matches) {
            // Find the actual file in the vault
            const imageFile = this.app.metadataCache.getFirstLinkpathDest(m.fileName, activeFile.path);
            
            if (imageFile instanceof TFile) {
                // Read binary and convert to Base64
                const binary = await this.app.vault.readBinary(imageFile);
                const base64 = arrayBufferToBase64(binary);
                
                // Determine MIME type
                const extension = imageFile.extension.toLowerCase();
                const mimeType = extension === 'jpg' ? 'image/jpeg' : `image/${extension}`;
                
                // Create standard Markdown data URI
                const dataUri = `![${imageFile.name}](data:${mimeType};base64,${base64})`;
                
                // Replace the wikilink with the embedded data URI
                content = content.replace(m.fullMatch, dataUri);
                replacedCount++;
            }
        }

        // Generate the new file alongside the original
        const parentPath = activeFile.parent?.path === '/' ? '' : activeFile.parent?.path + '/';
        const newFileName = `${parentPath}${activeFile.basename} - Standalone.md`;
        
        try {
            const existingFile = this.app.vault.getAbstractFileByPath(newFileName);
            if (existingFile instanceof TFile) {
                // Overwrite if it already exists
                await this.app.vault.modify(existingFile, content);
            } else {
                // Create new
                await this.app.vault.create(newFileName, content);
            }
            new Notice(`Exported! Embedded ${replacedCount} images.`);
        } catch (error) {
            console.error(error);
            new Notice('Error creating the standalone file.');
        }
    }
}

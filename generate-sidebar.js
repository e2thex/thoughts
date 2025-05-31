const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, 'docs');

function generateSidebar(dir, basePath = '') {
    const items = fs.readdirSync(dir)
        .filter(file => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            return stat.isDirectory() || (stat.isFile() && file.endsWith('.md') && file !== '_sidebar.md');
        })
        .sort((a, b) => {
            // Sort directories first, then files
            const aIsDir = fs.statSync(path.join(dir, a)).isDirectory();
            const bIsDir = fs.statSync(path.join(dir, b)).isDirectory();
            if (aIsDir && !bIsDir) return -1;
            if (!aIsDir && bIsDir) return 1;
            return a.localeCompare(b);
        });

    let sidebar = '';
    
    // Add Home link at the top
    if (basePath === '') {
        sidebar += '* [Home](/)\n';
    }

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(basePath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // For directories, create a section header
            const dirName = item.charAt(0).toUpperCase() + item.slice(1);
            sidebar += `\n* ${dirName}\n`;
            
            // Recursively process the directory
            sidebar += generateSidebar(fullPath, relativePath)
                .split('\n')
                .map(line => '  ' + line)
                .join('\n');
        } else {
            // For markdown files, create a link
            const name = item.replace('.md', '');
            const displayName = name.charAt(0).toUpperCase() + name.slice(1);
            const link = relativePath.replace(/\\/g, '/');
            sidebar += `* [${displayName}](${link})\n`;
        }
    }

    return sidebar;
}

// Generate the sidebar content
const sidebarContent = generateSidebar(docsDir);

// Write to _sidebar.md
fs.writeFileSync(path.join(docsDir, '_sidebar.md'), sidebarContent);

console.log('Sidebar generated successfully!'); 
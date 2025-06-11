import path from 'path'
import fs from 'fs'

const copyFile = async (filePath) => {
  try {
    const fileName = path.basename(filePath, '.svg');
    const content = await fs.promises.readFile(filePath, 'utf-8');

    // Add class to the SVG element
    const modifiedContent = content.replace(
      /<svg/,
      `<svg class="icon ${fileName}"`
    );

    const targetPath = `snippets/${fileName}.liquid`;

    await fs.promises.writeFile(targetPath, modifiedContent, 'utf-8');
    console.log(`SVG plugin: Successfully copied to ${targetPath}`);

    return true;
  } catch (error) {
    console.error('SVG plugin error:', error);
    return false;
  }
};

const svgToLiquidPlugin = () => ({
  name: 'svg-to-liquid',

  async buildStart() {
    console.log('SVG plugin: Starting build process');

    try {
      const files = await fs.promises.readdir('src/icons');
      const svgFiles = files.filter(file => file.endsWith('.svg'));

      for (const file of svgFiles) {
        await copyFile(`src/icons/${file}`);
      }
    } catch (error) {
      console.error('SVG plugin build error:', error);
    }
  },

  async handleHotUpdate({ file, server }) {
    if (file.includes('src/icons') && file.endsWith('.svg')) {
      console.log(`SVG plugin: Detected change in ${file}`);

      if (await copyFile(file)) {
        server.ws.send({
          type: 'full-reload'
        });
        console.log('SVG plugin: Triggered page reload');
      }
    }
  },

  configureServer(server) {
    console.log('SVG plugin: Development server configured');
    server.watcher.on('change', (path) => {
      if (path.includes('src/icons') && path.endsWith('.svg')) {
        console.log(`SVG plugin: Watcher detected change in ${path}`);
      }
    });
  }
});

export default svgToLiquidPlugin;
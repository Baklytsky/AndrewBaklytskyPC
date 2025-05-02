export default function liquidReloadPlugin(options = { delay: 3000 }) {
  return {
    name: 'vite-plugin-liquid-reload',
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.liquid')) {
        console.log('Liquid file changed:', file);

        setTimeout(() => {
          server.ws.send({ type: 'full-reload' });
        }, options.delay);

        return [];
      }
    }
  };
}


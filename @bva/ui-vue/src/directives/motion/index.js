import path from 'path';

export default function motion(context) {
  this.addPlugin({
    src: path.resolve(__dirname, './motionPlugin.js'),
    options: this.options.motion,
  });
}

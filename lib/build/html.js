const transform = require('gulp-transform');

// Strips data-test-id from templates
function stripDataTestId() {
  return transform('utf8', (content) => {
    return content.replace(/([\n\r\s]*)data-test-id=['"][^"']*['"]/gm, '');
  });
}

exports.stripDataTestId = stripDataTestId;

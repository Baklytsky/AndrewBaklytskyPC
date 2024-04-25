const selectors = {
  overflowBackground: '[data-overflow-background]',
  overflowFrame: '[data-overflow-frame]',
  overflowContent: '[data-overflow-content]',
  overflowContainer: '[data-overflow-container]',
  overflowWrapper: '[data-overflow-wrapper]',
};

function singles(frame, wrappers) {
  // sets the height of any frame passed in with the
  // tallest preventOverflowContent as well as any image in that frame
  let tallest = 0;

  wrappers.forEach((wrap) => {
    tallest = wrap.offsetHeight > tallest ? wrap.offsetHeight : tallest;
  });
  const images = frame.querySelectorAll(selectors.overflowBackground);
  const frames = [frame, ...images];
  frames.forEach((el) => {
    el.style.setProperty('min-height', `calc(${tallest}px + var(--header-height))`);
  });
}

function doubles(section) {
  if (window.innerWidth < window.theme.sizes.small) {
    // if we are below the small breakpoint, the double section acts like two independent
    // single frames
    let singleFrames = section.querySelectorAll(selectors.overflowFrame);
    singleFrames.forEach((singleframe) => {
      const wrappers = singleframe.querySelectorAll(selectors.overflowContent);
      singles(singleframe, wrappers);
    });
    return;
  }

  let tallest = 0;

  const frames = section.querySelectorAll(selectors.overflowFrame);
  const contentWrappers = section.querySelectorAll(selectors.overflowContent);
  contentWrappers.forEach((content) => {
    if (content.offsetHeight > tallest) {
      tallest = content.offsetHeight;
    }
  });
  const images = section.querySelectorAll(selectors.overflowBackground);
  let applySizes = [...frames, ...images];
  applySizes.forEach((el) => {
    el.style.setProperty('min-height', `${tallest}px`);
  });
  section.style.setProperty('min-height', `${tallest}px`);
}

function preventOverflow(container) {
  const singleFrames = container.querySelectorAll(selectors.overflowContainer);
  if (singleFrames) {
    singleFrames.forEach((frame) => {
      const wrappers = frame.querySelectorAll(selectors.overflowContent);
      singles(frame, wrappers);
      document.addEventListener('theme:resize', () => {
        singles(frame, wrappers);
      });
    });
  }

  const doubleSections = container.querySelectorAll(selectors.overflowWrapper);
  if (doubleSections) {
    doubleSections.forEach((section) => {
      doubles(section);
      document.addEventListener('theme:resize', () => {
        doubles(section);
      });
    });
  }
}

export default preventOverflow;

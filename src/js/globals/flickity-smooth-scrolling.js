import Flickity from 'flickity';

// iOS smooth scrolling fix
function flickitySmoothScrolling(slider) {
  const flkty = Flickity.data(slider);

  if (!flkty) {
    return;
  }

  flkty.on('dragStart', (event, pointer) => {
    document.ontouchmove = function (e) {
      e.preventDefault();
    };
  });

  flkty.on('dragEnd', (event, pointer) => {
    document.ontouchmove = function (e) {
      return true;
    };
  });
}

export default flickitySmoothScrolling;

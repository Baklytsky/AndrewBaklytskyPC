const player_buttons_video = document.querySelectorAll(
  ".ra-hero__player-control-video"
);
const player_buttons_sound = document.querySelectorAll(
  ".ra-hero__player-control-sound"
);

const handleVimeo = (method, block_id, view, type) => {
  document
    .querySelectorAll(`.ra-${type}-video-block-id-${block_id}-${view}`)
    .forEach((video) => {
      switch (method) {
        case "play":
          if (type === "vimeo") {
            video.contentWindow.postMessage('{"method":"play"}', "*");
          } else if (type === "youtube") {
            video.contentWindow.postMessage(
              '{"event":"command","func":"' + "playVideo" + '","args":""}',
              "*"
            );
          } else {
            video.play();
          }
          break;
        case "pause":
          if (type === "vimeo") {
            video.contentWindow.postMessage('{"method":"pause"}', "*");
          } else if (type === "youtube") {
            video.contentWindow.postMessage(
              '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
              "*"
            );
          } else {
            video.pause();
          }
          break;
        case "mute":
          if (type === "vimeo") {
            video.contentWindow.postMessage(
              '{"method":"setVolume", "value":0}',
              "*"
            );
          } else if (type === "youtube") {
            video.contentWindow.postMessage(
              '{"event":"command","func":"' + "mute" + '","args":""}',
              "*"
            );
          } else {
            video.muted = !video.muted;
          }
          break;
        case "unmute":
          if (type === "vimeo") {
            video.contentWindow.postMessage(
              '{"method":"setVolume", "value":1}',
              "*"
            );
          } else if (type === "youtube") {
            video.contentWindow.postMessage(
              '{"event":"command","func":"' + "unMute" + '","args":""}',
              "*"
            );
          } else {
            video.muted = !video.muted;
          }
          break;
      }
    });
};

const handleSound = (button) => {
  const block_id = button.getAttribute("block-id");
  const view = button.getAttribute("view");
  const type = button.getAttribute("data-type");
  if (button.getAttribute("active") === "false") {
    handleVimeo("mute", block_id, view, type);
    player_buttons_sound.forEach(function (elem) {
      if (
        elem.getAttribute("block-id") === block_id &&
        elem.getAttribute("view") === view
      ) {
        button.setAttribute("active", true);
      }
    });
  } else {
    handleVimeo("unmute", block_id, view, type);
    player_buttons_sound.forEach(function (elem) {
      if (
        elem.getAttribute("block-id") === block_id &&
        elem.getAttribute("view") === view
      ) {
        button.setAttribute("active", false);
      }
    });
  }
};

const handlePlayback = (button) => {
  const block_id = button.getAttribute("block-id");
  const view = button.getAttribute("view");
  const type = button.getAttribute("data-type");
  if (button.getAttribute("active") === "false") {
    handleVimeo("pause", block_id, view, type);
    player_buttons_video.forEach(function (elem) {
      if (
        elem.getAttribute("block-id") === block_id &&
        elem.getAttribute("view") === view
      ) {
        button.setAttribute("active", true);
      }
    });
  } else {
    handleVimeo("play", block_id, view, type);
    player_buttons_video.forEach(function (elem) {
      if (
        elem.getAttribute("block-id") === block_id &&
        elem.getAttribute("view") === view
      ) {
        button.setAttribute("active", false);
      }
    });
  }
};

//video button

player_buttons_video.forEach(function (elem) {
  elem.addEventListener("click", function () {
    handlePlayback(elem);
  });
});

//sound button
player_buttons_sound.forEach(function (elem) {
  elem.addEventListener("click", function () {
    handleSound(elem);
  });
});

(() => {
  const sources = {
    scores: {
      tone: "score",
      poster: "https://images.pexels.com/videos/15448985/pexels-photo-15448985.jpeg?auto=compress&cs=tinysrgb&w=1800",
      video: "https://videos.pexels.com/video-files/15448985/15448985-hd_1920_1080_30fps.mp4",
    },
    groups: {
      tone: "groups",
      poster: "https://images.pexels.com/videos/15448985/pexels-photo-15448985.jpeg?auto=compress&cs=tinysrgb&w=1800",
      video: "https://videos.pexels.com/video-files/15448985/15448985-hd_1920_1080_30fps.mp4",
    },
    teams: {
      tone: "teams",
      poster: "https://images.pexels.com/videos/9440064/pexels-photo-9440064.jpeg?auto=compress&cs=tinysrgb&w=1800",
      video: "https://videos.pexels.com/video-files/9440064/9440064-hd_1920_1080_25fps.mp4",
    },
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function addMotionBackground(section, config) {
    if (!section || section.querySelector(":scope > .wc-motion-bg")) return;

    section.classList.add("has-bg-motion");

    const layer = document.createElement("div");
    layer.className = `wc-motion-bg is-${config.tone}`;
    layer.setAttribute("aria-hidden", "true");
    layer.style.backgroundImage = `url("${config.poster}")`;

    if (!prefersReducedMotion && config.video) {
      const video = document.createElement("video");
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.poster = config.poster;
      video.src = config.video;
      video.addEventListener("canplay", () => {
        layer.classList.add("is-ready");
        video.play().catch(() => {});
      }, { once: true });
      video.addEventListener("error", () => {
        layer.classList.remove("is-ready");
      }, { once: true });
      layer.append(video);
    }

    section.prepend(layer);
  }

  function install() {
    for (const [id, config] of Object.entries(sources)) {
      addMotionBackground(document.getElementById(id), config);
    }
  }

  install();
  new MutationObserver(install).observe(document.getElementById("root"), {
    childList: true,
    subtree: true,
  });
})();

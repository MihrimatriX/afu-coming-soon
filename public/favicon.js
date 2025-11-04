(function () {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    document.head.appendChild(link);
  }

  function createSimpleFavicon() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 32, 32);

    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A', 16, 15);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 0.7;
    ctx.strokeText('A', 16, 15);

    try {
      const dataURL = canvas.toDataURL('image/png');
      link.href = dataURL;
      return true;
    } catch {
      return false;
    }
  }

  function applyGlitchEffect() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    try {
      ctx.clearRect(0, 0, 32, 32);

      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('A', 16, 15);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 0.7;
      ctx.strokeText('A', 16, 15);

      const imageData = ctx.getImageData(0, 0, 32, 32);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) {
          if (Math.random() > 0.85) {
            const offset = Math.floor(Math.random() * 50) - 25;
            data[i] = Math.max(0, Math.min(255, data[i] + offset));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] - offset));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + offset));
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      link.href = dataURL;

      setTimeout(() => {
        createSimpleFavicon();
      }, 200);

      return true;
    } catch {
      return false;
    }
  }
  if (createSimpleFavicon()) {
    setTimeout(() => {
      applyGlitchEffect();

      setInterval(() => {
        if (Math.random() > 0.7) {
          applyGlitchEffect();
        }
      }, 1000);
    }, 2000);
  }
})();

(function () {
  const originalTitle = document.title;
  let titleInterval;

  function typeAndEraseTitle() {
    let isTyping = true;
    let currentIndex = 0;

    titleInterval = setInterval(() => {
      if (isTyping) {
        currentIndex++;
        if (currentIndex <= originalTitle.length) {
          document.title = originalTitle.substring(0, currentIndex) + "▌";
        } else {
          document.title = originalTitle + "▌";
          setTimeout(() => {
            isTyping = false;
          }, 1000);
        }
      } else {
        currentIndex--;
        if (currentIndex >= 0) {
          document.title = originalTitle.substring(0, currentIndex) + "▌";
        } else {
          isTyping = true;
          currentIndex = 0;
        }
      }
    }, 150);
  }

  function setAttentionTitle() {
    let dots = "";
    let attentionInterval = setInterval(() => {
      dots = dots.length >= 3 ? "" : dots + ".";
      document.title = "Geri Dön" + dots;
    }, 500);

    document.addEventListener('visibilitychange', function onVisibilityChange() {
      if (!document.hidden) {
        clearInterval(attentionInterval);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        typeAndEraseTitle();
      }
    });
  }

  setTimeout(() => {
    typeAndEraseTitle();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(titleInterval);
        setAttentionTitle();
      }
    });
  }, 1000);
})(); 
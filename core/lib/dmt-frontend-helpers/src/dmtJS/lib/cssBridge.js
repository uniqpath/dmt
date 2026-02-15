class CssBridge {
  setWallpaper(wallpaperSubPath) {
    if (!wallpaperSubPath) {
      document.body.style.backgroundImage = '';
    } else if (wallpaperSubPath.startsWith('/')) {
      document.body.style.backgroundImage = `url('${wallpaperSubPath}')`;
    }
  }

  setBodyClass(className) {
    const body = document.getElementsByTagName('body')[0];
    body.className = className;
  }
}

export default new CssBridge();

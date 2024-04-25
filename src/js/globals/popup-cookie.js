class PopupCookie {
  constructor(name, value) {
    this.configuration = {
      expires: null, // session cookie
      path: '/',
      domain: window.location.hostname,
      sameSite: 'none',
      secure: true,
    };
    this.name = name;
    this.value = value;
  }

  write() {
    const hasCookie = document.cookie.indexOf('; ') !== -1 && !document.cookie.split('; ').find((row) => row.startsWith(this.name));
    if (hasCookie || document.cookie.indexOf('; ') === -1) {
      document.cookie = `${this.name}=${this.value}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}; sameSite=${this.configuration.sameSite}; secure=${this.configuration.secure}`;
    }
  }

  read() {
    if (document.cookie.indexOf('; ') !== -1 && document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
      const returnCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith(this.name))
        .split('=')[1];

      return returnCookie;
    } else {
      return false;
    }
  }

  destroy() {
    if (document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
      document.cookie = `${this.name}=null; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}; sameSite=${this.configuration.sameSite}; secure=${this.configuration.secure}`;
    }
  }
}

export {PopupCookie};

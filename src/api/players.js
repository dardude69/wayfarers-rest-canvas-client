import api from '.';
import url from 'url';

export default {

  createPlayer: async (username, password) => {
    const requestUrl = url.resolve(api.baseUrl, '/api/v1/players');

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: api.buildHeaders()
        .setContentTypeJson()
        .get(),
      body: JSON.stringify({ username, password })
    });

    if (response.status == 409) {
      throw new Error('Username already taken! Pick a different one.');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  },

  authenticatePlayer: async (username, password) => {
    const requestUrl = `${url.resolve(api.baseUrl, '/api/v1/players')}/${encodeURIComponent(username)}/authentication`;

    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: api.buildHeaders()
        .setBasicAuth(username, password)
        .get()
    });

    if (response.ok) {
      return true;
    }

    if (response.status === 401) {
      /* Unauthorized. */
      return false;
    }

    throw new Error(`HTTP ${response.status}`);
  }

};

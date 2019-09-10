import api from '.';
import assert from 'assert';
import url from 'url';

export default {

  player: (username, password) => ({

    create: async () => {
      const requestUrl = url.resolve(api.baseUrl, '/api/v2/players');

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
        throw response.status;
      }
    },

    authenticate: async () => {
      const requestUrl = `${url.resolve(api.baseUrl, '/api/v2/players')}/${encodeURIComponent(username)}/authentication`;

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
        return false;  /* Unauthorized. */
      }

      throw response.status;
    },

    move: async direction => {
      assert(['left', 'right', 'up', 'down'].includes(direction));

      const requestUrl = `${url.resolve(api.baseUrl, '/api/v2/players')}/${encodeURIComponent(username)}/movements`;

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: api.buildHeaders()
          .setBasicAuth(username, password)
          .setContentTypeJson()
          .get(),
        body: JSON.stringify({ direction })
      });

      if (!response.ok) {
        throw response.status;
      }
    }

  })

};

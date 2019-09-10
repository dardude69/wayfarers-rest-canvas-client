import api from '.';
import url from 'url';

export default {

  player: (username, password) => ({

    get: async () => {
      const requestUrl = `${url.resolve(api.baseUrl, '/api/v2/snapshot')}/${encodeURIComponent(username)}`;

      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: api.buildHeaders()
          .setBasicAuth(username, password)
          .get()
      });

      if (!response.ok) {
        throw response.status;
      }

      return await response.json();
    }

  })

};

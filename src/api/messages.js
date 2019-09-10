import api from '.';
import url from 'url';

export default {

  send: async ({ id, username, password, content }) => {
    const requestUrl = url.resolve(api.baseUrl, '/api/v2/messages');

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: api.buildHeaders()
        .setContentTypeJson()
        .setBasicAuth(username, password)
        .get(),
      body: JSON.stringify({
        sender: {
          id,
          username,
        },
        content
      })
    });

    if (!response.ok) {
      throw response.status;
    }
  }

}

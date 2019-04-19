import api from '.';
import url from 'url';

export default {

  send: async message => {
    const requestUrl = url.resolve(api.baseUrl, '/api/v1/messages');

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: api.buildHeaders()
        .setContentTypeJson()
        .get(),
      body: JSON.stringify({ body: message })
    });

    if (!response.ok) {
      throw response.status;
    }
  }

}

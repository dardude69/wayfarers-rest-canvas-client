export default {
  baseUrl: 'https://zakstephens.com:3000/',

  buildHeaders: (headers=new Headers()) => {
    const builder = {
      setBasicAuth: (username, password) => {
        headers.set('Authorization', `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`);
        return builder;
      },

      setContentTypeJson: header => {
        headers.set('Content-Type', 'application/json');
        return builder;
      },

      get: () => headers
    };

    return builder;
  }


};

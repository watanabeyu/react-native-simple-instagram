export default async (method = 'GET', url = '', params = {}, token = null) => {
  let uri = token ? `${url}?access_token=${token}` : url;
  let body = null;

  if (method !== 'POST') {
    uri += `&${Object.keys(params).sort().map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&')}`;
  } else {
    body = new FormData();
    Object.keys(params).forEach((key) => {
      body.append(key, params[key]);
    });
  }

  const options = {
    method,
    headers: {
      'Content-Type': (method === 'POST') ? 'multipart/form-data' : 'application/json',
    },
    body,
  };

  const result = await fetch(uri, options)
    .then((response) => {
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.indexOf('application/json') !== -1) {
        return response.json();
      }

      return response.text();
    });

  return result;
};

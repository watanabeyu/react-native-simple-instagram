/* lib */
import Request from './request';

/* const */
const baseURL = 'https://api.instagram.com';
const apiURL = 'https://api.instagram.com/v1';
const authorizationURL = '/oauth/authorize';
const accessTokenURL = '/oauth/access_token';

class Client {
  ClientId = null
  ClientSecret = null
  RedirectUri = null
  Token = null

  /**
   * set clientId
   */
  setClientId = (clientId = null, clientSecret = null) => {
    this.ClientId = clientId;
    this.ClientSecret = clientSecret;
  }

  /**
   * set access token
   */
  setAccessToken = (token) => {
    this.Token = token;
  }

  /**
   * get login url
   */
  getLoginUrl = async (redirectUri = '', type = 'token', scope = ['basic', 'public_content']) => {
    this.RedirectUri = redirectUri;

    return `${baseURL + authorizationURL}?client_id=${this.ClientId}&redirect_uri=${redirectUri}&response_type=${type}&scope=${scope.join('+')}`;
  }

  /**
   * get access token
   */
  getAccessToken = async (code = '') => {
    if (!this.ClientSecret) {
      throw new Error('instagram client secret is undefined');
    }

    const result = await Request(
      'POST',
      baseURL + accessTokenURL,
      {
        client_id: this.ClientId,
        client_secret: this.ClientSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.RedirectUri,
        code,
      },
    );

    if (!result.error_message) {
      this.setAccessToken(result.access_token);
      return result.access_token;
    }

    return { errors: result };
  }

  /**
   * call Instagram Api
   */
  api = async (method = 'GET', endpoint, params = {}) => {
    const apiMethod = method.toUpperCase();
    const apiEndpoint = endpoint.slice(0, 1) !== '/' ? `/${endpoint}` : endpoint;

    const result = await Request(
      apiMethod,
      apiURL + apiEndpoint,
      params,
      this.Token,
    );

    return result;
  }

  /**
   * api("POST",endpoint,params) alias
   */
  post = async (endpoint, params = {}) => {
    const result = await this.api('POST', endpoint, params);

    return result;
  }

  /**
   * api("GET",endpoint,params) alias
   */
  get = async (endpoint, params = {}) => {
    const result = await this.api('GET', endpoint, params);

    return result;
  }
}

export default new Client();

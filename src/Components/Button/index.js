import React from 'react';
import {
  View,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Modal,
  WebView,
  NativeModules,
} from 'react-native';

/* npm */
import SafeAreaView from 'react-native-safe-area-view';

/* components */
import Header from '../Header';

/* client */
import instagram from '../../client';
import styles from './styles';

export default class InstagramLoginButton extends React.Component {
  static defaultProps = {
    type: 'TouchableOpacity',
    headerColor: '#f7f7f7',
    clearCookies: false,
    callbackUrl: null,
    responseType: 'token', // code or token
    scope: ['basic', 'public_content'],
    onPress: () => { },
    onGetAccessToken: () => { },
    onClose: () => { },
    onSuccess: () => { },
    onError: () => { },
    renderHeader: props => <Header {...props} />,
  }

  constructor(props) {
    super(props);

    this.state = {
      isVisible: false,
      authUrl: null,
    };

    this.token = null;
    this.user = null;
  }

  componentDidMount() {
    if (this.props.responseType !== 'code' && this.props.responseType !== 'token') {
      console.warn('[react-native-simple-instagram] <InstagramLoginButton />\'s responseType is code or token.');
    }
  }

  onNavigationStateChange = async (webViewState) => {
    if (this.props.responseType === 'code') {
      const match = webViewState.url.match(/\?code=(.+)/);

      if (match && match.length > 0) {
        this.setState({
          isVisible: false,
        });

        /* get access token */
        try {
          const response = await instagram.getAccessToken(match[1]);

          if (response.errors) {
            throw new Error(JSON.stringify(response.errors));
          }

          this.token = response;
        } catch (err) {
          console.warn(`[getAccessToken failed] ${err}`);
          this.props.onError(err);

          return false;
        }

        await this.props.onGetAccessToken(this.token);

        /* get account */
        try {
          const response = await instagram.get('/users/self');

          if (response.meta.code !== 200) {
            throw new Error(JSON.stringify(response.meta));
          }

          this.user = response.data;
        } catch (err) {
          console.warn(`[/users/self failed] ${err}`);
          this.props.onError(err);

          return false;
        }

        await this.props.onSuccess(this.user);

        return true;
      }
    } else if (this.props.responseType === 'token') {
      const match = webViewState.url.match(/#access_token=(.+)/);

      if (match && match.length > 0) {
        this.setState({
          isVisible: false,
        });

        const token = match[1];
        this.token = token;

        instagram.setAccessToken(this.token);
        await this.props.onGetAccessToken(this.token);

        /* get account */
        try {
          const response = await instagram.get('/users/self');

          if (response.meta.code !== 200) {
            throw new Error(JSON.stringify(response.meta));
          }

          this.user = response.data;
        } catch (err) {
          console.warn(`[/users/self failed] ${err}`);
          this.props.onError(err);

          return false;
        }

        await this.props.onSuccess(this.user);

        return true;
      }

      return false;
    }

    return false;
  }

  onButtonPress = async (e) => {
    if (this.props.clearCookies) {
      NativeModules.Networking.clearCookies(() => { });
    }

    await this.props.onPress(e);

    this.setState({
      isVisible: true,
      authUrl: await instagram.getLoginUrl(this.props.callbackUrl, this.props.responseType, this.props.scope),
    });
  }

  onClose = async (e) => {
    this.setState({
      isVisible: false,
    }, () => this.props.onClose(e));
  }

  onMessage = (evt) => {
    const html = evt.nativeEvent.data;
    const match = html.match(/<pre style=.+>(.+)<\/pre>/);

    if (match && match.length > 0) {
      console.warn(`[instagram error] ${match[1]}`);
      setTimeout(() => this.setState({ isVisible: false }), 17);
    }
  }

  onError = (evt) => {
    this.props.onError(evt.nativeEvent);
    setTimeout(() => this.setState({ isVisible: false }), 17);
  }

  injectedScript = () => {
    window.postMessage(document.body.innerHTML);
    window.postMessage = window.originalPostMessage || window.postMessage;
  }

  renderHeader = (props) => {
    if (this.props.renderHeader) {
      return React.cloneElement(this.props.renderHeader(props), props);
    }

    return <Header {...props} />;
  }

  render() {
    let Component;

    switch (this.props.type) {
      case 'TouchableOpacity':
        Component = TouchableOpacity;
        break;
      case 'TouchableHighlight':
        Component = TouchableHighlight;
        break;
      case 'TouchableWithoutFeedback':
        Component = TouchableWithoutFeedback;
        break;
      default:
        console.warn('InstagramLoginButton type must be TouchableOpacity or TouchableHighlight or TouchableWithoutFeedback');
        return null;
    }

    if (!this.props.callbackUrl) {
      console.warn('[react-native-simple-instagram] <InstagramLoginButton /> must have a callbackUrl props');
      return null;
    }

    return (
      <Component {...this.props} onPress={this.onButtonPress}>
        <View style={{ flex: 1 }}>
          {this.props.children}
          <Modal visible={this.state.isVisible} animationType="slide" onRequestClose={() => { }}>
            <SafeAreaView style={[styles.safeArea, { backgroundColor: this.props.headerColor }]}>
              {this.renderHeader({ headerColor: this.props.headerColor, onClose: this.onClose })}
              <WebView
                source={{ uri: this.state.authUrl }}
                onNavigationStateChange={this.onNavigationStateChange}
                injectedJavaScript={`(${String(this.injectedScript)})()`}
                onMessage={this.onMessage}
                onError={this.onError}
              />
            </SafeAreaView>
          </Modal>
        </View>
      </Component>
    );
  }
}

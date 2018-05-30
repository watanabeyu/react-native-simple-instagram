import React from 'react'
import { AppLoading, Asset, Font, Constants } from 'expo'
import Navigation from 'rnstexampleapp/src'

/* npm */
import instagram from 'react-native-simple-instagram'

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoadingComplete: false
    }
  }

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={(error) => console.warn(error)}
          onFinish={() => this.setState({ isLoadingComplete: true })}
        />
      )
    }
    else {
      return <Navigation />
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('rnstexampleapp/assets/images/icon.png'),
        require('rnstexampleapp/assets/images/ok_man.png')
      ]),
      instagram.setClientId(Constants.manifest.extra.instagram.clientId)
    ])
  };
}
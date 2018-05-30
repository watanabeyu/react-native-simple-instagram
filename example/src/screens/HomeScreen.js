import React from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet
} from 'react-native'
import { connect } from 'react-redux'

/* import instagram */
import instagram from 'react-native-simple-instagram'

@connect(
  state => ({
    user: state.user
  })
)
export default class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { state, setParams } = navigation
    const { params = {} } = navigation.state

    return {
      headerTitle: "ホーム"
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      url: null,
      width: 0,
      height: 0,
    }
  }

  onButtonPress = (e) => {
    instagram.get("/users/self/media/recent").then(r => {
      const { carousel_media, images } = r.data[0]

      this.setState(images ? { ...images.low_resolution } : null)

      if (!r.errors) {
        Alert.alert(
          "Success",
          "取得できました",
          [
            {
              text: 'ok',
              onPress: () => console.log("ok")
            }
          ]
        )
      }
      else {
        console.warn(r)
      }
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ justifyContent: "center", alignItems: "center", paddingTop: 32, }}>
          {this.state.url && <Image source={{ uri: this.state.url }} style={{ width: this.state.width, height: this.state.height }} />}
          {!this.state.url && <Image source={require('rnstexampleapp/assets/images/ok_man.png')} style={{ width: 184, height: 200 }} />}
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{this.props.user.full_name} @{this.props.user.username}</Text>
          <Text style={styles.description}>{this.props.user.bio}</Text>
          <TouchableOpacity style={styles.button} onPress={this.onButtonPress}>
            <Text style={styles.buttonText}>最新の画像を取ってくる</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1,
    padding: 32
  },
  name: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#1da1f2",
    paddingVertical: 16
  },
  buttonText: {
    textAlign: "center",
    fontSize: 16,
    color: "#fff"
  }
})
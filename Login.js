import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';

const storeData = async (value) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem('@user', jsonValue)
  } catch (e) {
    // saving error
  }
}

export default function Login({ setLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = () => {
    console.log(username, password);
    setLoggedIn(true);
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={username}
        onChangeText={(username) => setUsername(username)}
        placeholder={'Username'}
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={(password) => setPassword(password)}
        placeholder={'Password'}
        secureTextEntry={true}
        style={styles.input}
      />
      <Button
        title={'Login with Channel-I'}
        style={styles.input}
        onPress={onLogin}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
  },
  input: {
    width: 200,
    height: 44,
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 10,
  },
});

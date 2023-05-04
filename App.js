import { useEffect, useState } from "react";
import Home from "./Home";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from "./Login";

const getData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('@user')
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch(e) {
    console.log(e)
  }
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getData().then((data) => {
      if (data) {
        setUser(data);
        setLoggedIn(true);
      }
    });
  }, []);

  return (
    <>
      {
        loggedIn ? <Home user={user} /> :
        <Login setLoggedIn={setLoggedIn}/>
      }
    </>
  );
}
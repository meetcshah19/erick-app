import { Button, Dimensions, StyleSheet, Text, View, Color, Modal, Pressable, Linking, Alert, Platform } from 'react-native';
import axios from 'axios';
import { useEffect, useState } from 'react';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


const colors = ["red", "orange", "tomato", "yellow", "green", "linen", "blue", "aqua", "teal", "violet", "purple", "indigo", "turquoise", "navy", "plum"];

const findColorById = (id) => {
  return colors[Number(id.substr(id.length - 3)) % colors.length];
}

export const callNumber = phone => {
  console.log('callNumber ----> ', phone);
  let phoneNumber = phone;
  if (Platform.OS !== 'android') {
    phoneNumber = `telprompt:${phone}`;
  }
  else {
    phoneNumber = `tel:${phone}`;
  }
  Linking.canOpenURL(phoneNumber)
    .then(supported => {
      if (!supported) {
        Alert.alert('Phone number is not available');
      } else {
        return Linking.openURL(phoneNumber);
      }
    })
    .catch(err => console.log(err));
};

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showNearestErick, setShowNearestErick] = useState(false);
  const [data, setData] = useState([]);
  const [nearestErickIds, setNearestErickIds] = useState([]);

  const getLocationCronJob = () => {
    axios.get("http://23.97.156.142:4000/get_erick_data").then((res) => {
      console.log(JSON.stringify(res.data));
      setData(res.data);
    }).catch((err) => {
      console.log(JSON.stringify(err));
    });
    setTimeout(
      getLocationCronJob
      , 2000);
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      console.log(location);
    })();
    getLocationCronJob();
  }, []);

  const compare = (a, b) => {
    let distA = Math.pow(a.data.lat - location.coords.latitude, 2) + Math.pow(a.data.lng - location.coords.longitude, 2);
    let distB = Math.pow(b.data.lat - location.coords.latitude, 2) + Math.pow(b.data.lng - location.coords.longitude, 2);
    if (distA < distB) {
      return -1;
    } else if (distA > distB) {
      return 1;
    } else {
      return 0;
    }
  }
  useEffect(() => {
    if (location)
      data.sort(compare);
    setNearestErickIds(data);
  }, [data]);

  return (
    <View style={styles.container}>
      <Modal animationType="slide" transparent={true} visible={showNearestErick}>
        <View style={styles.modalContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Nearest E-Rickshaws</Text>

            <Pressable onPress={() => { setShowNearestErick(false) }} style={{ justifyContent: "center" }}>
              <MaterialIcons name="close" color="#000000" size={22} />
            </Pressable>
          </View>
          <View style={styles.erickContainer}>
          {
            nearestErickIds.slice(0, 3).map((obj) => {
              console.log(obj)
              return ([
                <Text key={obj._id}> {obj.data.driver_name}</Text>,
                <Pressable key={"call" + obj._id} onPress={() => { callNumber(obj.data.driver_contact) }} style={{ justifyContent: "center" }}>
                  <MaterialIcons name="call" color={findColorById(obj.data.erick_id)} size={22} />
                </Pressable>
              ])
            })
          }
          </View>
        </View>
      </Modal>

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          latitude: 29.8668153,
          longitude: 77.8968807,
          latitudeDelta: 0.01,
          longitudeDelta: 0.015,
        }}
        showsUserLocation={location ? true : false}
        followsUserLocation={true}
      >
        {
          data ?
            data.map((erick) => {
              const color = findColorById(erick.data.erick_id);
              return <Marker key={erick._id} coordinate={{ latitude: erick.data.lat, longitude: erick.data.lng }} pinColor={color} />
            })
            : null
        }
      </MapView>
      <Button onPress={() => { setShowNearestErick(true) }} title="Find Nearest E-Rickshaws" color="#841584" />
      <Text> {errorMsg} </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    height: '10%',
    width: '100%',
    backgroundColor: '#25292e',
    position: 'absolute',
    bottom: 0,
  },
  titleContainer: {
    height: '50%',
    backgroundColor: '#464C55',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  erickContainer: {
    height: '50%',
    backgroundColor: '#464C55',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  }
});

import { Button, Dimensions, StyleSheet, Text, View, Color, Modal, Pressable, Linking, Alert, Platform, Image } from 'react-native';
import axios from 'axios';
import { useEffect, useState } from 'react';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Scanner from './Scanner';

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

export default function Home() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showNearestErick, setShowNearestErick] = useState(false);
  const [showNearestCycles, setShowNearestCycles] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [data, setData] = useState([]);
  const [nearestErickIds, setNearestErickIds] = useState([]);
  const [unlockedCycle, setUnlockedCycle] = useState(null);

  const lockCycle = () => {
    let data = JSON.stringify({
      "id": unlockedCycle,
      "state": "lock"
    });

    let config = {
      method: 'post',
      url: 'http://20.106.103.28:4000/downlink/',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    axios(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
    setUnlockedCycle(null);
  }
  const unlockCycle = (id) => {
    let data = JSON.stringify({
      "id": id,
      "state": "unlock"
    });

    let config = {
      method: 'post',
      url: 'http://20.106.103.28:4000/downlink/',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    axios(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
    setUnlockedCycle(id);
  }

  const getLocationCronJob = () => {
    axios.get("http://20.106.103.28:4000/get_erick_data").then((res) => {
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
    <>
      {(unlockedCycle == null) ? (
        <View style={styles.container}>
          <Modal animationType="slide" transparent={true} visible={showNearestCycles}>
            <View style={styles.modalContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Nearest Cycles</Text>

                <Pressable onPress={() => { setShowNearestCycles(false) }} style={{ justifyContent: "center" }}>
                  <MaterialIcons name="close" color="#232323" size={22} />
                </Pressable>
              </View>
              {
                nearestErickIds.slice(0, 5).map((obj) => {
                  if (obj._id.search("cui") != -1) {
                    return (
                      <View style={styles.erickContainer}>
                        <Text key={obj._id} style={{ color: "#593C8F", fontSize: 16 }}> {obj.data.driver_name}</Text>
                        <Pressable key={"call" + obj._id} onPress={() => { unlockCycle(obj._id) }} style={{ justifyContent: "center" }}>
                          <MaterialIcons name="lock-open" color={findColorById(obj.data.erick_id)} size={22} />
                        </Pressable>
                      </View>
                    )
                  }
                })
              }
            </View>
          </Modal>
          <Modal animationType="slide" transparent={true} visible={showNearestErick}>
            <View style={styles.modalContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Nearest E-Rickshaws</Text>

                <Pressable onPress={() => { setShowNearestErick(false) }} style={{ justifyContent: "center" }}>
                  <MaterialIcons name="close" color="#232323" size={22} />
                </Pressable>
              </View>
              {
                nearestErickIds.slice(0, 5).map((obj) => {
                  if (obj._id.search("eui") != -1) {
                    return (
                      <View style={styles.erickContainer}>
                        <Text key={obj._id} style={{ color: "#593C8F", fontSize: 16 }}> {obj.data.driver_name}</Text>
                        <Pressable key={"call" + obj._id} onPress={() => { callNumber(obj.data.driver_contact) }} style={{ justifyContent: "center" }}>
                          <MaterialIcons name="call" color={findColorById(obj.data.erick_id)} size={22} />
                        </Pressable>
                      </View>
                    )
                  }
                })
              }
            </View>
          </Modal>
          <Modal animationType="slide" transparent={true} visible={showScanner}>
            <View style={styles.scannerModalContent}>
              <View style={styles.scannerTitleContainer}>
                <Text style={styles.title}>Scan cycle QR</Text>
                <Pressable onPress={() => { setShowScanner(false) }} style={{ justifyContent: "center" }}>
                  <MaterialIcons name="close" color="#232323" size={22} />
                </Pressable>
              </View>
              <Scanner setShowScanner={setShowScanner} unlockCycle={unlockCycle} />
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
          <Pressable onPress={() => { setShowNearestCycles(true) }} style={{ alignSelf: 'flex-end' }}>
            <Image
              source={require('./assets/cycle.png')}
              fadeDuration={0}
              style={{ width: 70, height: 70, alignSelf: 'flex-end', marginRight: 20, marginBottom: 15 }}
            />
          </Pressable>
          <Pressable onPress={() => { setShowNearestErick(true) }} style={{ alignSelf: 'flex-end' }}>
            <Image
              source={require('./assets/erick.png')}
              fadeDuration={0}
              style={{ width: 70, height: 70, alignSelf: 'flex-end', marginRight: 20, marginBottom: 15 }}
            />
          </Pressable>
          <Button title="Scan QR" color="#1AA6AD" onPress={() => { setShowScanner(true) }} />
          <Text> {errorMsg} </Text>

        </View>)
        : (
          <View style={styles.container}>
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
            </MapView>
            <Button title="Lock Cycle" color="#1AA6AD" onPress={() => { lockCycle() }} />
          </View>
        )
      }
    </>
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
    height: '30%',
    width: '100%',
    backgroundColor: '#ffffff',
    position: 'absolute',
    bottom: 0,
  },
  scannerModalContent: {
    height: '80%',
    width: '100%',
    backgroundColor: '#ffffff',
    position: 'absolute',
    bottom: 0,
  },
  scannerTitleContainer: {
    height: '10%',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    height: '20%',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    color: '#593C8F',
    fontWeight: 'bold'
  },
  erickContainer: {
    height: '25%',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  }
});

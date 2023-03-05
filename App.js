import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TextInput, Alert, Button, Keyboard } from 'react-native';
import { API_TOKEN } from '@env';
import MapView, { Marker } from 'react-native-maps';
import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import * as Location from 'expo-location';


// geokoodaus, osoitepalvelu karttapalvelun sisässä
// esim. mapquest-palvelussa. haetaan osoitteella -> hakee koordinaattien mukaan
// alkuun initial region, jota näytetään, ennen kuin käyttäjä tekee haun
// kun kirjottaa osoitteen -> sillä tehdään geokoodauspyyntö -> saadaan koordinaatit -> asetetaan ne koordinaatit mapview:lle, 
// niin että se mapview päivittyy siihen mitä halutaan näyttää eli siihen osoitteeseen


export default function App() {

  const initial = {
        latitude: 60.15524,
        longitude: 24.9117114,
        latitudeDelta: 0.0322,
        longitudeDelta: 0.0221
  };

  const [region, setRegion] = useState(initial);
  const [osoite, setOsoite] = useState('');


  useEffect(() => {
    const fetchLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if ( status !== 'granted') {
        Alert.alert('No permission to access location');
      } else {
        try {
          let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High});
          console.log(location);
          setRegion({ ...region, latitude: location.coords.latitude, longitude: location.coords.longitude });
        } catch (error) {
          console.log(error.message);
        }
      }
    }
    fetchLocation();
  }, []);
       
  const fetchCoordinates = async (osoite) => {
      const KEY = API_TOKEN
      const url = `http://www.mapquestapi.com/geocoding/v1/address?key=${KEY}&location=${osoite}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        const lat = data.results[0].locations[0].latLng.lat;
        const lng = data.results[0].locations[0].latLng.lng;

        console.log(lat, lng);
        setRegion({ ...region, latitude: lat, longitude: lng})
      } catch (error) {
        console.error('API call failed. Did you provide a valid API key?', error.message);
        }
        Keyboard.dismiss();
        }

    /*
    VAIHTOEHTOINEN

    const fetchCoordinates = (address) => {
      const KEY = API_TOKEN
      const url = `http://www.mapquestapi.com/geocoding/v1/address?key=${KEY}&location=${osoite}`;

      fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        const lat = data.results[0].locations[0].latLng.lat;
        const lng = data.results[0].locations[0].latLng.lng;
        setRegion({ ...region, latitude: lat, longitude: lng})
      })
      .catch(error => console.error('API call failed. Did you provide a valid API key?', error.message))
      }
     */


  return (
    <View style={styles.container}>
      <MapView
        style={{ width: '100%', height: '90%' }}
        region={region}
        >
        <Marker coordinate={region} />
      </MapView>
      <TextInput
        placeholder={'Osoite'}
        value={osoite}
        onChangeText= {text => setOsoite(text)}
        />
        <Button 
          title = "Show" 
          onPress = {() => fetchCoordinates(osoite)} />
        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
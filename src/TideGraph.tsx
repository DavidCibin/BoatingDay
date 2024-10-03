import React, { useEffect, useState } from 'react';
import LineChart from 'react-native-chart-kit/dist/line-chart';
import {
  Dimensions,
  View,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Text,
} from 'react-native';
import axios from 'axios';
import moment from 'moment';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { WeatherProps } from "./Main";

export default function TideGraph({ coordinates }: { coordinates: number[] }): React.JSX.Element {
  /*****************************************************************/
  /* State */
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(moment().add(1, 'days').toDate());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [allTideStations, setAllTideStations] = useState();
  const [nearestTideStations, setNearestTideStations] = useState();

  const [tideData, setTideData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });

  /*****************************************************************/
    /* Data Fetching */
    // Function to calculate the distance between two points using the Haversine formula
    function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
      const R = 6371; // Radius of the Earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in km
      return distance;
    }
  
    // Example function to filter stations based on a given radius (in km)
    function filterStationsByRadius(stations: any, lat: number, lon: number, radius: number) {
      console.log("ALL STATIONS", stations.length, "LAT && LONG", lat, lon, "RADIUS", radius);
      return stations.filter((station: any) => {
        const distance = haversineDistance(lat, lon, parseFloat(station.lat), parseFloat(station.lng));
        return distance <= radius;
      });
    }
  
    const getTide = async () => {
      try {
        const response = await axios.get(
          `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions&units=english`
        );
        // console.log("ALL STATIONS", response.data.stations.length, "LAT && LONG", lat, lon);
        console.log("FIRST STATION", response.data.stations[0]);
        setAllTideStations(response.data.stations);
      } catch (error: any) {
        console.log(error);
      } finally {
        // console.log("CALL FETCH TIDE DATA");
        // fetchTideData(lat, lon);
      }
    };
    

    const fetchTideData = async (lat: number, lon: number) => {
      console.log("FETCH TIDE DATA WAS CALLED LAT && LONG", lat, lon);
      if (!allTideStations) return;
      const nearbyStations = filterStationsByRadius(allTideStations, lat, lon, 50);
      console.log("NEARBY BY STATIONS", nearbyStations.length);
      
      if (nearbyStations.length === 0) {
        console.error("No nearby stations found for the given location.");
        return;
      }
      
      console.log("NEARBY BY STATION ID", nearbyStations[0].id);
      setNearestTideStations(nearbyStations);
      const station = nearbyStations[0].id;
      
      try {
        setLoading(true);
        const response = await axios.get(
          `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&datum=MLLW&begin_date=${moment(
            startDate,
          ).format('MM/DD/YYYY')}&range=30&interval=hilo&units=english&time_zone=lst_ldt&format=json&station=${station}`
        );
    
        const predictions = response.data.predictions;
        
        const labels = predictions.map((prediction: any) =>
          moment(prediction.t).format('hh:mmA')
        );
        const data = predictions.map((prediction: any) =>
          parseFloat(prediction.v)
        );
        
        setTideData({ labels, datasets: [{ data }] });
      } catch (error: any) {
        console.error('Error fetching tide data:', error.message);
      } finally {
        setLoading(false);
      }
    };
    

  // useEffect(() => {
  //   fetchTideData();
  // }, [startDate, endDate]);
  
  useEffect(() => {
    getTide();
  }, []);
  
  useEffect(() => {
    if (!allTideStations) return;
    const [lat, lon] = coordinates;
    fetchTideData(lat, lon);
  }, [coordinates, allTideStations]);

  // const onStartDateChange = (
  //   event: DateTimePickerEvent,
  //   date?: Date | undefined,
  // ) => {
  //   const currentDate = date || startDate;
  //   setShowStartDatePicker(false);
  //   setStartDate(currentDate);
  // };

  // const onEndDateChange = (event: DateTimePickerEvent, date?: Date | undefined) => {
  //   const currentDate = date || endDate;
  //   setShowEndDatePicker(false);
  //   setEndDate(currentDate);
  // };

  return (
    <View style={styles.container}>
      {/* <View style={styles.dateContainer}>
        <Text style={styles.locationText}>{location}</Text>
        <Pressable
          style={styles.button}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text style={styles.btnText}>Start Date</Text>
        </Pressable>
        {showStartDatePicker && (
          <DateTimePicker
            testID="dateTimePickerStart"
            value={startDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onStartDateChange}
          />
        )}

        <Pressable
          style={styles.button}
          onPress={() => setShowEndDatePicker(true)}
        >
          <Text style={styles.btnText}>End Date</Text>
        </Pressable>
        {showEndDatePicker && (
          <DateTimePicker
            testID="dateTimePickerEnd"
            value={endDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onEndDateChange}
          />
        )}
      </View> */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3a92da" />
        </View>
      ) : (
        <View style={styles.chartContainer}>
          <LineChart
            data={tideData}
            width={Dimensions.get('window').width * 1.05}
            height={220}
            withHorizontalLines={false}
            withVerticalLines={false}
            fromZero={true}
            yAxisSuffix="ft"
            chartConfig={{
              backgroundColor: '#2a4c6d',
              backgroundGradientFrom: '#2a4c6d',
              backgroundGradientTo: '#2a4c6d',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#6b9bcc',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 10,
  },
  button: {
    display: "none", // TODO: buttons are hidden for now
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#3a92da',
    margin: 5,
  },
  btnText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  locationText: {
    color: 'white',
    fontSize: 15,
    // fontWeight: 'bold',
    textShadowColor: '#333',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
    paddingRight: 5,
  },
  chartContainer: {
    backgroundColor: '#2a4c6d',
    borderRadius: 20,
    padding: 10,
    overflow: "hidden",
    width: "95%",
  },
  chart: {
    marginLeft: -5,
    paddingTop: 12,
  },
});

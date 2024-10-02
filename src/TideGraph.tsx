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

export default function TideGraph({ station, location }: { station: string; location: string }): React.JSX.Element {
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
      color: '#3a92da',
      fontSize: 30,
      fontWeight: 'bold',
      textShadowColor: '#333',
      textShadowOffset: { width: -1, height: 1 },
      textShadowRadius: 5,
      paddingRight: 5,
    },
    chartContainer: {
      backgroundColor: '#2a4c6d',
      borderRadius: 20,
      padding: 10,
    },
    chart: {
      margin: 0,
      padding: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(moment().add(1, 'days').toDate());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [tideData, setTideData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });

  const fetchTideData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&datum=MLLW&begin_date=${moment(
          startDate,
        ).format('MM/DD/YYYY')}&range=30&interval=hilo&units=english&time_zone=lst_ldt&format=json&station=${station}`,
      );
      // const response = await axios.get(
      //   `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&datum=MLLW&begin_date=${moment(
      //     startDate,
      //   ).format('MM/DD/YYYY')}&end_date=${moment(endDate).format(
      //     'MM/DD/YYYY',
      //   )}&interval=hilo&units=english&time_zone=lst_ldt&format=json&station=${station}`,
      // );

      const predictions = response.data.predictions;
      console.log('Tide Data:', predictions);
      
      const labels = predictions.map((prediction: any) =>
        moment(prediction.t).format('hh:mmA'),
      );
      const data = predictions.map((prediction: any) =>
        parseFloat(prediction.v),
      );
      console.log('Tide Data:', { labels, data });
      
      setTideData({ labels, datasets: [{ data }] });
    } catch (error: any) {
      console.error('Error fetching tide data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTideData();
  }, [startDate, endDate]);

  const onStartDateChange = (
    event: DateTimePickerEvent,
    date?: Date | undefined,
  ) => {
    const currentDate = date || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  const onEndDateChange = (event: DateTimePickerEvent, date?: Date | undefined) => {
    const currentDate = date || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateContainer}>
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
      </View>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3a92da" />
        </View>
      ) : (
        <View style={styles.chartContainer}>
          <LineChart
            data={tideData}
            width={Dimensions.get('window').width * 0.9}
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

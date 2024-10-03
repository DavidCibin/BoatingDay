import React, { useEffect, useState } from "react";
import LineChart from "react-native-chart-kit/dist/line-chart";
import {
    Dimensions,
    View,
    ActivityIndicator,
    StyleSheet,
    Text,
} from "react-native";
import axios from "axios";
import moment from "moment";

import DropdownMenu from "./utils/DropdownMenu";

export default function TideGraph({
    coordinates,
}: {
    coordinates: number[];
}): React.JSX.Element {
    /*****************************************************************/
    /* State */
    const [loading, setLoading] = useState(true);
    const [nearestTideStations, setNearestTideStations] = useState<any[]>([]);
    const [stationName, setStationName] = useState<string>("");
    const [tideData, setTideData] = useState({
        labels: [],
        datasets: [{ data: [] }],
    });

    /*****************************************************************/
    /* Helper Functions */
    // Function to calculate the distance between two points using the Haversine formula
    function haversineDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ) {
        const R = 6371; // Radius of the Earth in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km
        return distance;
    }

    // Example function to filter stations based on a given radius (in km)
    function filterStationsByRadius(
        stations: any,
        lat: number,
        lon: number,
        radius: number
    ) {
        return stations.filter((station: any) => {
            const distance = haversineDistance(
                lat,
                lon,
                parseFloat(station.lat),
                parseFloat(station.lng)
            );
            return distance <= radius;
        });
    }

    /*****************************************************************/
    /* Data Fetching */
    const getTide = async (lat: number, lon: number) => {
        try {
            const response = await axios.get(
                `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions&units=english`
            );
            const nearbyStations = filterStationsByRadius(
                response.data.stations,
                lat,
                lon,
                50
            );
            setNearestTideStations(nearbyStations);
            fetchTideData(nearbyStations[0].id);
        } catch (error: any) {
            console.error("getTide", error);
        }
    };

    const fetchTideData = async (station: string) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&datum=MLLW&begin_date=${moment(
                    new Date()
                ).format(
                    "MM/DD/YYYY"
                )}&range=30&interval=hilo&units=english&time_zone=lst_ldt&format=json&station=${station}`
            );

            const predictions = response.data.predictions;
            const labels = predictions.map((prediction: any) =>
                moment(prediction.t).format("hh:mmA")
            );
            const data = predictions.map((prediction: any) =>
                parseFloat(prediction.v)
            );

            setTideData({ labels, datasets: [{ data }] });
        } catch (error: any) {
            console.error("Error fetching tide data:", error.message);
        } finally {
            setLoading(false);
        }
    };

    /*****************************************************************/
    /* Effects */
    useEffect(() => {
      if (!coordinates) return;
        const [lat, lon] = coordinates;
        getTide(lat, lon);
    }, [coordinates]);

    /*****************************************************************/
    /* Render */
    return (
        <View style={styles.container}>
            {nearestTideStations && nearestTideStations.length > 0 && (
                <DropdownMenu
                    nearbyStations={nearestTideStations}
                    fetchTideData={fetchTideData}
                    setStationName={setStationName}
                />
            )}

            {loading && tideData ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#3a92da" />
                </View>
            ) : (
                <View style={styles.chartContainer}>
                    <View style={styles.legendContainer}>
                        <Text style={styles.legendText}>{stationName}</Text>
                    </View>
                    <LineChart
                        data={tideData}
                        width={Dimensions.get("window").width * 1.05}
                        height={220}
                        withHorizontalLines={false}
                        withVerticalLines={false}
                        fromZero={true}
                        yAxisSuffix="ft"
                        chartConfig={{
                            backgroundColor: "#2a4c6d",
                            backgroundGradientFrom: "#2a4c6d",
                            backgroundGradientTo: "#2a4c6d",
                            decimalPlaces: 1,
                            color: (opacity = 1) =>
                                `rgba(255, 255, 255, ${opacity})`,
                            labelColor: (opacity = 1) =>
                                `rgba(255, 255, 255, ${opacity})`,
                            propsForDots: {
                                r: "6",
                                strokeWidth: "2",
                                stroke: "#6b9bcc",
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

/*****************************************************************/
/* Styles */
const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    chartContainer: {
        backgroundColor: "#2a4c6d",
        borderRadius: 20,
        padding: 10,
        overflow: "hidden",
        width: "95%",
    },
    chart: {
        marginLeft: -5,
        paddingTop: 12,
    },
    legendContainer: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    legendText: {
        fontSize: 16,
        color: "white",
    },
});

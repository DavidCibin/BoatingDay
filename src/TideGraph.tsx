import React, { useEffect, useState, useRef } from "react";
import LineChart from "react-native-chart-kit/dist/line-chart";
import {
    Dimensions,
    View,
    ActivityIndicator,
    StyleSheet,
    LayoutChangeEvent,
    Text as RNText,
} from "react-native";
import axios from "axios";
import moment from "moment";

import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";
import DropdownMenu from "./utils/DropdownMenu";

export default function TideGraph({
    coordinates,
}: {
    coordinates: number[];
}): React.JSX.Element {
    /*****************************************************************/
    /* State */
    const [height, setHeight] = useState(30);
    const [loading, setLoading] = useState(true);
    const [nearestTideStations, setNearestTideStations] = useState<any[]>([]);
    const [stationName, setStationName] = useState<string>("");
    const [tideTimes, setTideTimes] = useState<string[]>([]);
    const [tideData, setTideData] = useState({
        labels: [],
        datasets: [{ data: [] }],
    });
    const [currentTimeData, setCurrentTimeData] = useState({
        closestAfterIndex: 0,
        positionPercentage: 0,
    });

    /*****************************************************************/
    /* Variables */
    let previousX = 0;
    const elementRef = useRef<View>(null);

    /*****************************************************************/
    /* Helper Functions */
    const handleLayout = (event: LayoutChangeEvent) => {
        const { height } = event.nativeEvent.layout;
        setHeight(height);
    };

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

    function findTimeIndexesAndPercentage() {
        const currentTime = new Date();

        let closestBeforeIndex = -1;
        let closestAfterIndex = -1;

        for (let i = 0; i < tideTimes.length; i++) {
            const time = new Date(tideTimes[i]);
            if (time < currentTime) {
                closestBeforeIndex = i;
            } else if (time > currentTime && closestAfterIndex === -1) {
                closestAfterIndex = i;
            }
        }

        let positionPercentage = 0;
        if (closestBeforeIndex !== -1 && closestAfterIndex !== -1) {
            const beforeTime = new Date(tideTimes[closestBeforeIndex]);
            const afterTime = new Date(tideTimes[closestAfterIndex]);
            positionPercentage =
                (Number(currentTime) - Number(beforeTime)) /
                (Number(afterTime) - Number(beforeTime));
        }

        return setCurrentTimeData({ closestAfterIndex, positionPercentage });
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
                    "YYYY-MM-DD"
                )}&range=30&interval=hilo&units=english&time_zone=lst_ldt&format=json&station=${station}`
            );

            const predictions = response.data.predictions;
            const labels = predictions.map((prediction: any) =>
                moment(prediction.t).format("hh:mmA")
            );

            const times = predictions.map((prediction: any) =>
                moment(prediction.t)
            );

            const data = predictions.map((prediction: any) =>
                parseFloat(prediction.v)
            );

            setTideTimes(times);
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
        if (!coordinates.length) return;
        const [lat, lon] = coordinates;
        getTide(lat, lon);
    }, [coordinates]);
    useEffect(() => {
        findTimeIndexesAndPercentage();
    }, [tideTimes]);

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

            {loading ? (
                <View style={[{height: height}, styles.loaderContainer]}>
                    <ActivityIndicator size="large" color="#3a92da" />
                </View>
            ) : (
                <View 
                    style={styles.chartContainer}
                    ref={elementRef} 
                    onLayout={handleLayout}
                >
                    <View style={styles.legendContainer}>
                        <RNText style={styles.legendText}>{stationName}</RNText>
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
                        renderDotContent={({ x, y, index }) => {
                            if (index === currentTimeData.closestAfterIndex) {
                                const position =
                                    previousX +
                                    (x - previousX) *
                                        currentTimeData.positionPercentage;
                                return (
                                    <Svg
                                        key={x + y}
                                        height="100%"
                                        width="100%"
                                        style={{
                                            position: "absolute",
                                            left: position,
                                        }}
                                    >
                                        <Line
                                            x1={position}
                                            y1={0}
                                            x2={position}
                                            y2={185}
                                            stroke="#ccc"
                                            strokeWidth={2}
                                        />
                                        <Rect
                                            x={position - 33}
                                            y={80}
                                            width="66"
                                            height="19"
                                            fill="#45576a"
                                            rx="5"
                                            ry="5"
                                        />
                                        <SvgText
                                            x={position}
                                            y={90}
                                            fill="white"
                                            fontSize="12"
                                            textAnchor="middle"
                                            alignmentBaseline="middle"
                                        >
                                            {moment().format("hh:mmA")}
                                        </SvgText>
                                    </Svg>
                                );
                            }
                            previousX = x;
                        }}
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
        justifyContent: "space-evenly",
        alignItems: "center",
        flex: 1,
        paddingBottom: 10,
    },
    currentTimeIndicator: {
        position: "absolute",
        height: "100%",
        width: "100%",
    },
    verticalLine: {
        position: "absolute",
        width: 2,
        height: "100%",
        backgroundColor: "red",
        marginLeft: -5,
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
        position: "relative",
    },
    chart: {
        marginLeft: -15,
        paddingTop: 12,
        position: "relative",
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

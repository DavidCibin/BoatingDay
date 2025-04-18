import React, { useEffect, useState, useRef, useCallback } from "react";
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
import DatePicker from "./utils/DatePicker";

/** ************************************************************** */
/* Types */
export interface TideStation {
    id: number;
    name: string;
    lat: number;
    lng: number;
    [key: string]: unknown;
}

/** ************************************************************** */
/* Variables */
let styles: ReturnType<typeof StyleSheet.create>;

/** ************************************************************** */
/* TideGraph Component */
export default function TideGraph({
    coordinates,
}: {
    coordinates: number[];
}): React.JSX.Element {
    /** ************************************************************** */
    /* State */
    const [height, setHeight] = useState(30);
    const [loading, setLoading] = useState(true);
    const [nearestTideStations, setNearestTideStations] = useState<
        TideStation[]
    >([]);
    const [stationName, setStationName] = useState<string>("");
    const [currentStationId, setCurrentStationId] = useState<number>();
    const [tideTimes, setTideTimes] = useState<string[]>([]);
    const [tideDate, setTideDate] = useState(new Date());
    const [tideData, setTideData] = useState<{
        labels: string[];
        datasets: { data: number[] }[];
    }>({
        labels: [],
        datasets: [{ data: [] }],
    });
    const [currentTimeData, setCurrentTimeData] = useState({
        closestAfterIndex: 0,
        positionPercentage: 0,
    });

    /** ************************************************************** */
    /* Refs */
    const elementRef = useRef<View>(null);

    /** ************************************************************** */
    /* Functions */
    const handleLayout = (event: LayoutChangeEvent) => {
        const { height: layoutHeight } = event.nativeEvent.layout;
        setHeight(layoutHeight);
    };

    const haversineDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const fetchTideData = useCallback(
        async (station: number) => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&datum=MLLW&begin_date=${moment(
                        tideDate,
                    ).format(
                        "YYYY-MM-DD",
                    )}&range=30&interval=hilo&units=english&time_zone=lst_ldt&format=json&station=${station}`,
                );

                const {
                    predictions,
                }: { predictions: { t: string; v: string }[] } = response.data;

                const labels = predictions.map((p) =>
                    moment(p.t).format("hh:mmA"),
                );
                const times = predictions.map((p) => p.t);
                const data = predictions.map((p) => parseFloat(p.v));

                setTideTimes(times);
                setTideData({ labels, datasets: [{ data }] });
            } catch (error: unknown) {
                console.error("Error fetching tide data:", error);
            } finally {
                setLoading(false);
            }
        },
        [tideDate],
    );

    const getTide = useCallback(
        async (lat: number, lon: number) => {
            const filterStationsByRadius = (
                stations: TideStation[],
                latitude: number,
                longitude: number,
                radius: number,
            ) => {
                return stations.filter((station) => {
                    const distance = haversineDistance(
                        latitude,
                        longitude,
                        parseFloat(station.lat as unknown as string),
                        parseFloat(station.lng as unknown as string),
                    );
                    return distance <= radius;
                });
            };

            if (!lat || !lon) return;

            try {
                const response = await axios.get(
                    "https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions&units=english",
                );

                const nearbyStations = filterStationsByRadius(
                    response.data.stations,
                    lat,
                    lon,
                    50,
                );

                if (nearbyStations.length > 0) {
                    const selected = nearbyStations[0];
                    setNearestTideStations(nearbyStations);
                    setCurrentStationId(selected.id);
                    setStationName(selected.name);
                    fetchTideData(selected.id);
                }
            } catch (error: unknown) {
                console.error("getTide error:", error);
            }
        },
        [fetchTideData],
    );

    /** ************************************************************** */
    /* Effects */
    useEffect(() => {
        const [lat, lon] = coordinates;
        getTide(lat, lon);
    }, [coordinates, getTide]);

    useEffect(() => {
        if (currentStationId) fetchTideData(currentStationId);
    }, [tideDate, currentStationId, fetchTideData]);

    useEffect(() => {
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

        setCurrentTimeData({ closestAfterIndex, positionPercentage });
    }, [tideTimes]);

    /** ************************************************************** */
    /* Render */
    return (
        <View style={styles.container}>
            {nearestTideStations?.length > 0 && (
                <View style={styles.dropdownAndDateContainer}>
                    <DropdownMenu
                        nearbyStations={nearestTideStations}
                        fetchTideData={fetchTideData}
                        setStationName={setStationName}
                    />
                    <DatePicker tideDate={tideDate} setTideDate={setTideDate} />
                </View>
            )}

            {loading ? (
                <View style={[{ height }, styles.loaderContainer]}>
                    <ActivityIndicator size="large" color="#3a92da" />
                </View>
            ) : (
                <View
                    style={styles.chartContainer}
                    ref={elementRef}
                    onLayout={handleLayout}
                >
                    <View style={styles.topContainer}>
                        <RNText style={styles.legendText}>{stationName}</RNText>
                    </View>
                    <LineChart
                        data={tideData}
                        width={Dimensions.get("window").width * 1.05}
                        height={220}
                        withHorizontalLines={false}
                        withVerticalLines={false}
                        fromZero
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
                            const { closestAfterIndex, positionPercentage } =
                                currentTimeData;

                            if (index === closestAfterIndex) {
                                const position = x * positionPercentage;
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
                            return null;
                        }}
                        style={styles.chart}
                    />
                </View>
            )}
        </View>
    );
}

/** ************************************************************** */
/* Styles */
styles = StyleSheet.create({
    chart: {
        marginLeft: -15,
    },
    chartContainer: {
        backgroundColor: "#2a4c6d",
        borderRadius: 10,
        padding: 10,
    },
    container: {
        backgroundColor: "#1a2a3a",
        flex: 1,
        padding: 10,
    },
    dropdownAndDateContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    legendText: {
        color: "#fff",
        fontSize: 16,
    },
    loaderContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    topContainer: {
        alignItems: "center",
        marginBottom: 10,
    },
});

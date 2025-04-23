import * as d3 from "d3";
import {
    Svg,
    Path,
    Circle,
    Text,
    Line,
    G,
    Rect,
    Defs,
    LinearGradient,
    Stop,
} from "react-native-svg";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Dimensions,
    View,
    StyleSheet,
    ActivityIndicator,
    Text as RNText,
    PanResponder,
} from "react-native";
import axios from "axios";
import moment from "moment";
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
    const [loading, setLoading] = useState(true);
    const [tideDate, setTideDate] = useState(new Date());
    const [currentTide, setCurrentTide] = useState(Number);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [stationName, setStationName] = useState<string>("");
    const [currentStationId, setCurrentStationId] = useState<number>();
    const [draggedPosition, setDraggedPosition] = useState<number | null>(null);
    const [tideData, setTideData] = useState<{ time: Date; height: number }[]>(
        [],
    );
    const [nearestTideStations, setNearestTideStations] = useState<
        TideStation[]
    >([]);

    /** ************************************************************** */
    /* Constants */
    const width = Dimensions.get("window").width - 50;
    const height = 220;
    const margin = { top: 30, right: 30, bottom: 40, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    /** ************************************************************** */
    /* Functions */
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

    /** ************************************************************** */
    /* Data Fetching - Callbacks */
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

                const parsedData = predictions.map((d) => ({
                    time: moment(d.t, "YYYY-MM-DD HH:mm").toDate(),
                    height: parseFloat(d.v),
                }));

                setTideData(parsedData);
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

    /** ************************************************************** */
    /* D3 */
    /** ************************************************************** */
    /* D3 Setup with useMemo */

    const xScale = useMemo(() => {
        return d3
            .scaleTime()
            .domain(d3.extent(tideData, (d) => d.time) as [Date, Date])
            .range([0, innerWidth]);
    }, [tideData, innerWidth]);

    const { yScale, minHeight, maxHeight } = useMemo(() => {
        const rawHeights = tideData.map((d) => d.height);
        const min = Math.min(...rawHeights);
        const max = Math.max(...rawHeights);
        const scale = d3
            .scaleLinear()
            .domain([min, max])
            .range([innerHeight, 0]);

        return { yScale: scale, minHeight: min, maxHeight: max };
    }, [tideData, innerHeight]);

    const line = useMemo(() => {
        return d3
            .line<{ time: Date; height: number }>()
            .x((d) => xScale(d.time))
            .y((d) => yScale(d.height))
            .curve(d3.curveBumpX);
    }, [xScale, yScale]);

    const formatTime = useMemo(() => {
        return d3.utcFormat("%-I:%M%p"); // UTC formatting, e.g., 3:00PM
    }, []);

    const customTicks = useMemo(() => {
        const minTime = d3.min(tideData, (d) => d.time);
        const maxTime = d3.max(tideData, (d) => d.time);

        if (
            !minTime ||
            !maxTime ||
            Number.isNaN(minTime.getTime()) ||
            Number.isNaN(maxTime.getTime())
        ) {
            console.warn("minTime or maxTime is invalid:", {
                minTime,
                maxTime,
            });
            return [];
        }

        const tickCount = 5;
        return Array.from({ length: tickCount }, (_, i) => {
            return new Date(
                minTime.getTime() +
                    (i * (maxTime.getTime() - minTime.getTime())) /
                        (tickCount - 1),
            );
        });
    }, [tideData]);

    const currentTimeX = useMemo(
        () => xScale(currentTime),
        [xScale, currentTime],
    );

    const isTideDataValid = useMemo(() => {
        return (
            tideData.length > 0 &&
            !tideData.some((d) => !d.time || Number.isNaN(d.time.getTime()))
        );
    }, [tideData]);

    if (!isTideDataValid) {
        return <View />; // fallback view if data is invalid
    }

    /** ************************************************************** */
    /* PanResponder */
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
            const position = Math.max(
                0,
                Math.min(innerWidth, gestureState.moveX - margin.left - 20),
            );

            setDraggedPosition(position);
            const newTime = xScale.invert(position);
            setCurrentTime(newTime);

            const [before, after] = tideData.reduce<
                [
                    { time: Date; height: number } | null,
                    { time: Date; height: number } | null,
                ]
            >(
                (acc, curr) => {
                    if (curr.time <= newTime) acc[0] = curr;
                    if (curr.time >= newTime && !acc[1]) acc[1] = curr;
                    return acc;
                },
                [null, null],
            );

            // Interpolate between the two tide points
            let interpolatedTideLevel = 0;
            if (before && after) {
                const timeDiff = after.time.getTime() - before.time.getTime();
                const timeProgress = newTime.getTime() - before.time.getTime();
                const tideDiff = after.height - before.height;
                interpolatedTideLevel =
                    before.height + (timeProgress / timeDiff) * tideDiff;
            }

            if (interpolatedTideLevel) {
                setCurrentTide(interpolatedTideLevel);
            } else if (position < innerWidth) {
                setDraggedPosition(0.1);
            }
        },
        onPanResponderRelease: () => {
            setCurrentTide(0);
            setCurrentTime(new Date());
            setDraggedPosition(null);
        },
        onPanResponderTerminate: () => {
            setCurrentTide(0);
            setCurrentTime(new Date());
            setDraggedPosition(null);
        },
    });

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
                <View style={styles.chartContainer}>
                    <View style={styles.topContainer}>
                        <RNText style={styles.legendText}>{stationName}</RNText>
                    </View>
                    <Svg width={width} height={height}>
                        <G
                            transform={`translate(${margin.left}, ${margin.top})`}
                            onStartShouldSetResponder={
                                panResponder.panHandlers
                                    .onStartShouldSetResponder
                            }
                            onResponderMove={
                                panResponder.panHandlers.onResponderMove
                            }
                            onResponderRelease={
                                panResponder.panHandlers.onResponderRelease
                            }
                        >
                            {/* Tide Line */}
                            <Defs>
                                <LinearGradient
                                    id="tideGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <Stop
                                        offset="0%"
                                        stopColor="#617a9250"
                                        stopOpacity={0.8}
                                    />
                                    <Stop
                                        offset="50%"
                                        stopColor="#2a4c6d50"
                                        stopOpacity={0.3}
                                    />
                                    <Stop
                                        offset="100%"
                                        stopColor="#617a9250"
                                        stopOpacity={0.8}
                                    />
                                </LinearGradient>
                            </Defs>
                            <Path
                                d={line(tideData) ?? ""}
                                fill="url(#tideGradient)"
                                stroke="#617a92"
                                strokeWidth={3}
                            />

                            {/* Dots on Tide Points */}
                            {tideData.map((d) => (
                                <Circle
                                    key={`circle-${d.time.toISOString()}`}
                                    cx={xScale(d.time)}
                                    cy={yScale(d.height)}
                                    r={6}
                                    stroke="#6b9bcc"
                                    strokeWidth={2}
                                    fill="#ECEFF2"
                                />
                            ))}

                            {/* X-axis labels */}
                            <G transform={`translate(0, ${innerHeight})`}>
                                {customTicks.map((tick, i) => {
                                    const tickTime = `time-${i}`;
                                    return (
                                        <Text
                                            key={`x-tick-${tickTime}`}
                                            x={xScale(tick)}
                                            y={30}
                                            textAnchor="middle"
                                            fontSize={12}
                                            fill="#fff"
                                        >
                                            {formatTime(tick)}
                                        </Text>
                                    );
                                })}
                            </G>

                            {/* Y-axis lines and labels */}
                            {[...Array(5)].map((_, i) => {
                                const tick =
                                    minHeight +
                                    ((maxHeight - minHeight) / 4) * i;
                                return (
                                    <G
                                        key={`y-tick-${tick}`}
                                        transform={`translate(0, ${yScale(tick)})`}
                                    >
                                        <Line
                                            x2={innerWidth}
                                            stroke="#e0e0e010"
                                        />
                                        <Text
                                            x={-45}
                                            y={3}
                                            fontSize={12}
                                            fill="#fff"
                                        >
                                            {tick.toFixed(1)}ft
                                        </Text>
                                    </G>
                                );
                            })}

                            <View
                                style={{
                                    display:
                                        currentTimeX > 0 &&
                                        currentTimeX < innerWidth
                                            ? "flex"
                                            : "flex",
                                }}
                            >
                                <G>
                                    <Line
                                        x1={
                                            draggedPosition || currentTimeX - 55
                                        }
                                        y1={-15}
                                        x2={
                                            draggedPosition || currentTimeX - 55
                                        }
                                        y2={165}
                                        stroke="#ccc"
                                        strokeWidth={2}
                                    />
                                    <Rect
                                        x={
                                            draggedPosition
                                                ? draggedPosition - 32
                                                : currentTimeX - 88
                                        }
                                        y={draggedPosition ? 61 : 70}
                                        width={draggedPosition ? 64 : 66}
                                        height={draggedPosition ? 35 : 19}
                                        fill="#45576a"
                                        rx="5"
                                        ry="5"
                                    />
                                    <Text
                                        x={draggedPosition || currentTimeX - 55}
                                        y={80}
                                        fill="white"
                                        fontSize="12"
                                        textAnchor="middle"
                                        alignmentBaseline="middle"
                                    >
                                        {currentTide ? (
                                            <>
                                                <Text
                                                    x={
                                                        draggedPosition ||
                                                        currentTimeX - 55
                                                    }
                                                    dy="73"
                                                >
                                                    {`${currentTide.toFixed(1)}ft`}
                                                </Text>
                                                <Text
                                                    x={
                                                        draggedPosition ||
                                                        currentTimeX - 55
                                                    }
                                                    dy="87"
                                                >
                                                    {formatTime(currentTime)}
                                                </Text>
                                            </>
                                        ) : (
                                            // formatTime(currentTime)
                                            d3.timeFormat("%I:%M%p")(
                                                currentTime,
                                            )
                                        )}
                                    </Text>
                                </G>
                            </View>
                        </G>
                    </Svg>
                </View>
            )}
        </View>
    );
}

/** ************************************************************** */
/* Styles */
styles = StyleSheet.create({
    chartContainer: {
        backgroundColor: "#2a4c6d",
        borderRadius: 20,
        overflow: "hidden",
        padding: 10,
    },
    container: {
        alignItems: "center",
        flexGrow: 1,
    },
    dropdownAndDateContainer: {
        alignItems: "center",
        flexDirection: "row",
        flex: 1,
        gap: 20,
        justifyContent: "space-between",
        marginHorizontal: 12,
        maxHeight: 80,
        paddingHorizontal: 10,
        width: "100%",
    },
    legendText: {
        color: "#fff",
        fontSize: 16,
    },
    loaderContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    topContainer: {
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "space-around",
    },
});

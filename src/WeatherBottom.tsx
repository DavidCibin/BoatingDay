import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { getWindDirection } from "./utils/wind";
import { WeatherProps } from "./utils/WeatherProps";

/*****************************************************************/
/* CurrentForecastWidget Component */
export default function CurrentForecastWidget({
    currentWeather,
    location,
}: {
    currentWeather: WeatherProps;
    location: string;
}): JSX.Element {
    /*****************************************************************/
    /* State */
    const [currentLocation, setCurrentLocation] = useState("");

    /*****************************************************************/
    /* Effects */
    useEffect(() => {
        if (!location.includes("Unknown")) {
            setCurrentLocation(location);
        }
    }, [location]);

    /*****************************************************************/
    /* Render */
    if (!currentWeather && !currentLocation) {
        return (
            <View>
                <Text>Loading...</Text>
            </View>
        );
    }
    return (
        <View style={styles.currentView}>
            <View style={styles.secondaryInfoContainer}>
                <View style={styles.row}>
                    <View style={styles.detailsBox}>
                        <Text style={styles.label}>Feels</Text>
                        <Text style={styles.details}>
                            {Math.round(currentWeather.main.feels_like)}°F
                        </Text>
                    </View>
                    <View style={styles.detailsBox}>
                        <Text style={styles.label}>Low</Text>
                        <Text style={styles.details}>
                            {Math.round(currentWeather.main.temp_min)}°F
                        </Text>
                    </View>
                    <View style={styles.detailsBox}>
                        <Text style={styles.label}>High</Text>
                        <Text style={styles.details}>
                            {Math.round(currentWeather.main.temp_max)}°F
                        </Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.detailsBox}>
                        <Text style={styles.label}>Humidity</Text>
                        <Text style={styles.details}>
                            {currentWeather.main.humidity}%
                        </Text>
                    </View>
                    <View style={styles.detailsBox}>
                        <Text style={styles.label}>Wind</Text>
                        <Text style={styles.details}>
                            {currentWeather.wind.speed.toFixed(1)}mph
                        </Text>
                    </View>
                    <View style={styles.detailsBox}>
                        <Text style={styles.label}>Direction</Text>
                        <Text style={styles.wind}>
                            {getWindDirection(currentWeather.wind.deg)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

/*****************************************************************/
/* Styles */
const styles = StyleSheet.create({
    currentView: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-around",
    },
    secondaryInfoContainer: {
        backgroundColor: "#2a4c6d",
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        width: "95%",
        maxWidth: 478,
    },
    row: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        color: "white",
        padding: 10,
    },
    detailsBox: {
        width: "33.3%",
        paddingLeft: 20,
    },
    label: {
        color: "white",
        fontSize: 12,
    },
    details: {
        color: "white",
        fontSize: 20,
    },
    wind: {
        color: "white",
        fontSize: 20,
    },
});

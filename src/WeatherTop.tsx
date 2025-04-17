import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import WeatherProps from "./utils/WeatherProps";

/** ************************************************************** */
/* Variables */
let styles: ReturnType<typeof StyleSheet.create>;

/** ************************************************************** */
/* CurrentForecast Component */
export default function CurrentForecast({
    currentWeather,
    location,
}: {
    currentWeather: WeatherProps;
    location: string;
}): JSX.Element {
    /** ************************************************************** */
    /* State */
    const [currentLocation, setCurrentLocation] = useState("");

    /** ************************************************************** */
    /* Effects */
    useEffect(() => {
        if (!location.includes("Unknown")) {
            setCurrentLocation(location);
        }
    }, [location]);

    /** ************************************************************** */
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
            <Text
                style={styles.city}
                accessible
                accessibilityLabel={`City name: ${currentLocation}`}
            >
                {currentLocation.split(",")[0]}
            </Text>
            <View style={styles.mainInfoContainer}>
                <View style={styles.currentTempView}>
                    <Image
                        source={{
                            uri: `https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`,
                        }}
                        style={styles.weatherIcon}
                        resizeMode="contain"
                    />
                    <Text style={styles.currentDegrees}>
                        {Math.round(currentWeather.main.temp)}°F
                    </Text>
                </View>
                <Text style={styles.description}>
                    {currentWeather.weather[0].description}
                </Text>
            </View>
        </View>
    );
}

/** ************************************************************** */
/* Styles */
styles = StyleSheet.create({
    city: {
        color: "white",
        fontSize: 14,
        justifyContent: "center",
        marginTop: 40,
    },
    currentDegrees: {
        color: "white",
        fontSize: 60,
        justifyContent: "center",
    },
    currentTempView: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    currentView: {
        alignItems: "center",
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-around",
        width: "100%",
    },
    description: {
        color: "white",
        fontSize: 14,
        textTransform: "capitalize",
    },
    mainInfoContainer: {
        alignItems: "center",
    },
    weatherIcon: {
        height: 50,
        width: 50,
    },
});

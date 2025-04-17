import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { WeatherProps } from "./utils/WeatherProps";


export default function CurrentForecast({
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
            <Text
                style={styles.city}
                accessible={true}
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
                        resizeMode={"contain"}
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

/*****************************************************************/
/* Styles */
const styles = StyleSheet.create({
    currentView: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-around",
        width: "100%",
    },
    currentTempView: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    mainInfoContainer: {
        alignItems: "center",
    },
    description: {
        color: "white",
        fontSize: 14,
        textTransform: "capitalize",
    },
    weatherIcon: {
        width: 50,
        height: 50,
    },
    city: {
        color: "white",
        justifyContent: "center",
        marginTop: 40,
        fontSize: 14,
    },
    currentDegrees: {
        color: "white",
        justifyContent: "center",
        fontSize: 60,
    }
});

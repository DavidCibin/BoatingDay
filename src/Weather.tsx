import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { getWindDirection } from "./utils/wind";

export interface WeatherProps {
    name: string;
    weather: { icon: string; description: string }[];
    main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        humidity: number;
    };
    wind: { speed: number; deg: number };
}

export default function CurrentForecast({
    currentWeather,
    location,
}: {
    currentWeather: WeatherProps;
    location: string;
}): JSX.Element {
    /*****************************************************************/
    /* Render */
    if (!currentWeather && !location) {
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
                accessibilityLabel={`City name: ${location}`}
            >
                {location.split(",")[0]}
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    currentTempView: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    mainInfoContainer: {
        display: "flex",
        alignItems: "center",
    },
    description: {
        color: "white",
        fontSize: 15,
        textTransform: "capitalize",
    },
    secondaryInfoContainer: {
        backgroundColor: "#2a4c6d",
        borderRadius: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: 18,
        width: "95%",
        maxWidth: 478,
    },
    weatherIcon: {
        width: 50,
        height: 50,
    },
    city: {
        color: "white",
        justifyContent: "center",
        marginTop: 6,
        fontSize: 15,
    },
    currentDegrees: {
        color: "white",
        justifyContent: "center",
        marginTop: 5,
        fontSize: 50,
    },
    row: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        color: "white",
        padding: 10,
    },
    detailsBox: {
        display: "flex",
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

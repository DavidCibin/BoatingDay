import React, { useEffect, useState } from "react";
import {
    ImageBackground,
    View,
    Text,
    StyleSheet,
    ScrollView,
} from "react-native";
import axios from "axios";
import WaveAnimation from "./WaveAnimation";
import WeatherBottom from "./WeatherBottom";
import WeatherTop from "./WeatherTop";
import { WeatherProps } from "./utils/WeatherProps";
import LocationSearch from "./LocationSearch";
import TideGraph from "./TideGraph";
import * as Location from "expo-location";

/*****************************************************************/
/* Types */
interface LocationProps {
    position: Location.LocationObject;
    getGeolocation: () => void;
}

/*****************************************************************/
/* Main Component */
export default function Main({
    position,
    getGeolocation,
}: LocationProps): JSX.Element {
    /*****************************************************************/
    /* State */
    const [location, setLocation] = useState<string>("");
    const [weather, setTodaysWeather] = useState<WeatherProps>();
    const [coordinates, setCoordinates] = useState<number[]>([]);

    /*****************************************************************/
    /* Constants */
    const bgImg = { uri: "../assets/images/4.png" };

    /*****************************************************************/
    /* Data Fetching */
    const fetchByLocationHandler = async (location: string | number) => {
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/search?q=${location}&format=json&&accept-language=en&countrycodes=us&limit=1`
            );

            if (response.data.length === 0) {
                console.error("No data returned for this location");
                return;
            }

            const result = response.data[0];
            const address = result.address || {};
            const local = `${
                address.city || address.village || "Unknown city"
            }, ${address.state || "Unknown state"}`;

            setLocation(local);

            const lat = result.lat || null;
            const lon = result.lon || null;

            if (lat && lon) {
                setCoordinates([lat, lon]);
            } else {
                console.error("Coordinates not found");
            }

            if (address.postcode) {
                await getWeather(address.postcode);
            } else {
                await fetchByGeolocationHandler(lat, lon);
            }
        } catch (error) {
            console.error("fetchByLocationHandler", error);
        }
    };

    const fetchByGeolocationHandler = async (lat: number, lon: number) => {
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=geocodejson&lat=${lat}&lon=${lon}`
            );

            const data = response.data.features[0].properties;
            const location = `${data.geocoding.city}, ${data.geocoding.state}`;

            setLocation(location);
            await getWeather([lat, lon]);
            setCoordinates([lat, lon]);
        } catch (error) {
            console.error("fetchByGeolocationHandler", error);
        }
    };

    const getWeather = async (params: number | number[]) => {
        let q: string = "";
        if (typeof params === "number") {
            q = `zip=${params}`;
        } else {
            q = `lat=${params[0]}&lon=${params[1]}`;
        }
        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?${q}&exclude=hourly,minutely&units=imperial&appid=a0623b11ae5b6d63b28da3564cdd91c7`
            );
            setTodaysWeather(response.data);
        } catch (error) {
            console.error("Error fetching weather data", error);
        }
    };

    /*****************************************************************/
    /* Effects */
    useEffect(() => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchByGeolocationHandler(lat, lon);
    }, [position]);

    /*****************************************************************/
    /* Render */
    return (
        <View style={styles.container}>
            {weather && location ? (
                <ImageBackground source={bgImg} style={styles.imageBackground}>
                    <WeatherTop currentWeather={weather} location={location} />
                    <View style={styles.locationAndWeatherContainer}>
                        <LocationSearch
                            location={location}
                            setLocation={setLocation}
                            fetchByLocationHandler={fetchByLocationHandler}
                            getGeolocation={getGeolocation}
                        />
                        <WeatherBottom
                            currentWeather={weather}
                            location={location}
                        />
                    </View>
                    <TideGraph coordinates={coordinates} />
                </ImageBackground>
            ) : (
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    style={styles.views}
                >
                    <WaveAnimation />
                </ScrollView>
            )}
        </View>
    );
}

/*****************************************************************/
/* Styles */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-evenly",
        width: "100%",
    },
    imageBackground: {
        width: "100%",
        flex: 1,
        justifyContent: "space-evenly",
    },
    scrollView: {
        flex: 1,
    },
    futureForecastContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    noWeather: {
        textAlign: "center",
        color: "white",
    },
    locationAndWeatherContainer: {
        flex: 1,
        flexDirection: "column",
    },
    locationContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    views: {
        backgroundColor: "#172f46",
    },
});

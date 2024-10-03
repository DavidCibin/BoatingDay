import React, { useEffect, useState } from "react";
import {
    ScrollView,
    ImageBackground,
    View,
    Text,
    StyleSheet,
} from "react-native";
import axios from "axios";
import CurrentForecast from "./CurrentForecast";
import ForecastSearch from "./ForecastSearch";
import TideGraph from "./TideGraph";
import * as Location from "expo-location";

export interface WeatherProps {
    position: Location.LocationObject; // Using LocationObject from expo-location
}

export default function Main({ position }: WeatherProps): JSX.Element {
    /*****************************************************************/
    /* State */
    const [location, setLocation] = useState<string>("");
    const [weather, setTodaysWeather] = useState({});
    const [coordinates, setCoordinates] = useState<number[]>([]);

    /*****************************************************************/
    /* Constants */
    const bgImg = { uri: "../assets/images/4.png" };
    const weatherKey = "a0623b11ae5b6d63b28da3564cdd91c7";
    const googleKey = "AIzaSyBIcoExZtvc9ggGwTFkcvszZlsdh9CzQmE";

    /*****************************************************************/
    /* Data Fetching */

    // Fetch by location (city or zip code). ONLY WHEN USER SEARCHES!!
    const fetchByLocationHandler = async (location: string | number) => {
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/search?q=${location}&format=json&addressdetails=1&limit=1`
            );
            console.log("Google response BY CITY or ZIPCODE", response.data[0]);

            if (response.data.length === 0) {
                console.error("No data returned for this location");
                return; // Handle case where no data is returned
            }

            const data = response.data[0].address;
            const local = `${data.city ? data.city : data.village}, ${
                data.county ? data.county : data.district
            }, ${data.state}`;
            setLocation(local);
            setCoordinates([response.data[0].lat, response.data[0].lon]);
            await getWeather(data.postcode); // Assuming getWeather is also async
        } catch (error) {
            console.error("fetchByLocationHandler", error);
        }
    };

    // Fetch lat long by postal code/zip since OpenWeather Api only accepts zips
    const fetchByGeolocationHandler = async (lat: number, lon: number) => {
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=geocodejson&lat=${lat}&lon=${lon}`
            );
            const data = response.data.features[0].properties;
            const location = `${data.geocoding.city}, ${
                data.geocoding.county
                    ? data.geocoding.county
                    : data.geocoding.district
            }, ${data.geocoding.state}`;
            console.log("LOCATION", location);

            setLocation(location);
            await getWeather([lat, lon]); // Assuming getWeather is also async
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
                `https://api.openweathermap.org/data/2.5/weather?${q}&exclude=hourly,minutely&units=imperial&appid=${weatherKey}`
            );
            console.log("WEATHER RESPONSE", response.data);
            setTodaysWeather(response.data);
        } catch (error) {
            console.log("Error fetching weather data", error);
        }
    };

    /*****************************************************************/
    /* Effects */
    useEffect(() => {
        console.log("HERE ONLY ONE TIME??");
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
                    <ForecastSearch
                        location={location}
                        setLocation={setLocation}
                        fetchByLocationHandler={fetchByLocationHandler}
                    />
                    <CurrentForecast currentWeather={weather} />
                    <TideGraph coordinates={coordinates} />
                </ImageBackground>
            ) : (
                <Text style={styles.noWeather}>No Weather to show</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    imageBackground: {
        width: "100%",
        height: "100%",
    },
    scrollView: {
        flex: 1,
    },
    futureForecastContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    noWeather: {
        textAlign: "center",
        color: "white",
    },
    locationContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

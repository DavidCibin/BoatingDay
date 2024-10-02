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

interface WeatherProps {
    position: Location.LocationObject;  // Using LocationObject from expo-location
}


export default function Main({ position }: WeatherProps): JSX.Element {
    console.log("Initial Location on Main: ", position);
    /*****************************************************************/
    /* State */
    const [toggleSearch, setToggleSearch] = useState("city");
    const [city, setCity] = useState("Lakeville");
    const [postalCode, setPostalCode] = useState("02347");
    const [lat, setLat] = useState(41.8459);
    const [long, setLong] = useState(-70.9495);
    const [weather, setTodaysWeather] = useState({});
    // const [weatherDaily, setDailyWeather] = useState({});
    // const [position, setPosition] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    /*****************************************************************/
    /* Constants */
    const bgImg = { uri: "../assets/images/4.png" };
    const weatherKey = "a0623b11ae5b6d63b28da3564cdd91c7";
    const googleKey = "AIzaSyBIcoExZtvc9ggGwTFkcvszZlsdh9CzQmE";

    /*****************************************************************/
    /* Data Fetching */
    //fetch lat long by city
    const fetchLatLongHandler = () => {
        axios
            .get(
                 `http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${weatherKey}`
            )
            .then(function (response) {
                console.log("weather response BY CITY", response.data);
                setLat(response.data.coord.lat);
                setLong(response.data.coord.lon);
                getWeather(response.data.coord.lat, response.data.coord.lon);
            })
            .catch(function (error: any) {
                console.error(error);
            });
    };

    //fetch lat long by postal code/zip since OpenWeather Api only accepts zips
    const fetchByPostalHandler = () => {
        axios
            .get(
                 `https://maps.googleapis.com/maps/api/geocode/json?key=${googleKey}&components=postal_code:${postalCode}`
            )
            .then(function (response) {
                console.log("Google response BY ZIPCODE", response.data);
                setLat(response.data.results[0].geometry.location.lat);
                setLong(response.data.results[0].geometry.location.lng);
            })
            .catch(function (error: any) {
                console.error(error);
            });
    };

    const getWeather = (lat: number, lon: number) => {
        axios
            .get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=imperial&appid=${weatherKey}`
            )
            .then(function (response) {
                console.log("weather response", response.data);
                setTodaysWeather(response.data);
                setCity(response.data.name);
            })
            .catch(function (error: any) {
                console.log(error);
            });
    };

    /*****************************************************************/
    /* Effects */
    useEffect(() => {
        if (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeather(lat, lon);
        }
    }, [position]);

    /*****************************************************************/
    /* Render */
    return (
        <View style={styles.container}>
            {weather ? (
                <ImageBackground source={bgImg} style={styles.imageBackground}>
                    <ForecastSearch
                        city={city}
                        setCity={setCity}
                        fetchLatLongHandler={fetchLatLongHandler}
                        toggleSearch={toggleSearch}
                        setToggleSearch={setToggleSearch}
                        fetchByPostalHandler={fetchByPostalHandler}
                        setPostalCode={setPostalCode}
                        postalCode={postalCode}
                    />
                    <CurrentForecast
                        currentWeather={weather}
                    />
                    <TideGraph station={'8446493'} location={'Plymouth, MA'} />
                </ImageBackground>
            ) : (
                <Text style={styles.noWeather}>No Weather to show</Text>
            )}
        </View>
    );
};

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
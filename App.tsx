import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    useColorScheme,
    StyleSheet,
    View,
    Text,
} from "react-native";
import Weather from "./src/Weather";
import WaveAnimation from "./src/WaveAnimation";
import { Colors } from "react-native/Libraries/NewAppScreen";
import * as Location from "expo-location";

export default function App(): JSX.Element {
    /*****************************************************************/
    /* State */
    const isDarkMode = useColorScheme() === "dark";
    const [position, setPosition] = useState<Location.LocationObject | null>(
        null
    );
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    /*****************************************************************/
    /* Functions */
    const getGeolocation = async () => {
        setIsLoading(true);
        setPosition(null);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            setErrorMsg("Permission to access location was denied");
            setIsLoading(false);
            return;
        }

        try {
            const location = await Location.getCurrentPositionAsync({});
            console.log("Initial Position from geolocation: ", location);
            setPosition(location);
        } catch (error) {
            setErrorMsg("Error fetching location");
        } finally {
            setIsLoading(false);
        }
    };

    /*****************************************************************/
    /* Constants */
    const backgroundStyle = {
        backgroundColor: isDarkMode ? "midnightblue" : "dodgerblue",
        // backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    /*****************************************************************/
    /* Effects */
    useEffect(() => {
        getGeolocation();
    }, []);

    /*****************************************************************/
    /* Render */
    return (
        <SafeAreaView style={[backgroundStyle, styles.container]}>
            <StatusBar
                barStyle={isDarkMode ? "dark-content" : "light-content"}
                backgroundColor={backgroundStyle.backgroundColor}
            />
            {isLoading ? (
                // Show the WaveAnimation while loading
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    style={backgroundStyle}
                >
                    <WaveAnimation />
                </ScrollView>
            ) : (
                // Render the regular content when after loading
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    style={backgroundStyle}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        {/* <GeoLocation setLoading={setIsLoading} /> */}
                        {position ? (
                            <Weather position={position} />
                        ) : (
                            <Text>Waiting for location...</Text>
                        )}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      width: "100%",
      height: "100%",
  },
});

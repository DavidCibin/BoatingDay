import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    useColorScheme,
    StyleSheet,
    View,
    Text,
    Button,
} from "react-native";
import Main from "./src/Main";
import WaveAnimation from "./src/WaveAnimation";
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
    const [isPermissionGranted, setIsPermissionGranted] = useState(true);

    /*****************************************************************/
    /* Functions */
    const getGeolocation = async () => {
        setIsLoading(true);
        setPosition(null);
        const { status } = await Location.requestForegroundPermissionsAsync();
        setIsPermissionGranted(status === "granted");
        if (status !== "granted") {
            setErrorMsg("Permission to access location was denied");
            setIsLoading(false);
            return;
        }
        try {
            const location = await Location.getCurrentPositionAsync({});
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
        backgroundColor: isDarkMode ? "#233e59" : "#172f46",
    };

    /*****************************************************************/
    /* Effects */
    useEffect(() => {
        getGeolocation();
    }, []);

    /*****************************************************************/
    /* Render */
    return isPermissionGranted ? (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={isDarkMode ? "dark-content" : "light-content"}
                backgroundColor={backgroundStyle.backgroundColor}
            />
            {isLoading ? (
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <WaveAnimation />
                </ScrollView>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View
                        style={{
                            flex: 1,
                        }}
                    >
                        {/* <GeoLocation setLoading={setIsLoading} /> */}
                        {position ? (
                            <Main
                                position={position}
                                getGeolocation={getGeolocation}
                            />
                        ) : (
                            <Text>Waiting for location...</Text>
                        )}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    ) : (
        <SafeAreaView style={styles.container}>
            <Text>{errorMsg}</Text>
            <Text>Please, allow location access to continue</Text>
            <Button title="Try Again" onPress={getGeolocation} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'space-evenly',
        flexDirection: 'column',
    },
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#172f46",
        paddingTop: 10,
        paddingBottom: 10,
    },
});

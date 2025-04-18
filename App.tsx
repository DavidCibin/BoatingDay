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
import * as Location from "expo-location";
import Main from "./src/Main";
import WaveAnimation from "./src/WaveAnimation";

/** ************************************************************** */
/* Variables */
let styles: ReturnType<typeof StyleSheet.create>;

/** ************************************************************** */
/* App Component */
export default function App(): JSX.Element {
    /** ************************************************************** */
    /* State */
    const isDarkMode = useColorScheme() === "dark";
    const [position, setPosition] = useState<Location.LocationObject | null>(
        null,
    );
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPermissionGranted, setIsPermissionGranted] = useState(true);

    /** ************************************************************** */
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
            setErrorMsg("Error fetching location:");
            console.error("Error fetching location:", error);
        } finally {
            setIsLoading(false);
        }
    };

    /** ************************************************************** */
    /* Constants */
    const backgroundStyle = {
        backgroundColor: isDarkMode ? "#233e59" : "#172f46",
    };

    /** ************************************************************** */
    /* Effects */
    useEffect(() => {
        getGeolocation();
    }, []);

    /** ************************************************************** */
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

/** ************************************************************** */
/* Styles */
styles = StyleSheet.create({
    container: {
        backgroundColor: "#172f46",
        flex: 1,
        paddingBottom: 10,
        paddingTop: 10,
        width: "100%",
    },
    scrollViewContent: {
        flexDirection: "column",
        flexGrow: 1,
        justifyContent: "space-evenly",
    },
});

import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Text } from "react-native";

/** ************************************************************** */
/* Types */
interface LocationSearchProps {
    location: string;
    setLocation: (location: string) => void;
    fetchByLocationHandler: (location: string) => void;
    getGeolocation: () => void;
}

/** ************************************************************** */
/* Variables */
let styles: ReturnType<typeof StyleSheet.create>;

/** ************************************************************** */
/* LocationSearch Component */
export default function LocationSearch({
    location,
    setLocation,
    fetchByLocationHandler,
    getGeolocation,
}: LocationSearchProps): React.JSX.Element {
    /** ************************************************************** */
    /* State */
    const [searchValue, setSearchValue] = useState("");

    /** ************************************************************** */
    /* Effects */
    useEffect(() => {
        if (!location.includes("Unknown")) {
            setSearchValue(location);
        }
    }, [location]);

    /** ************************************************************** */
    /* Functions */
    const handleSubmit = () => {
        setLocation(searchValue);
        fetchByLocationHandler(searchValue);
    };

    /** ************************************************************** */
    /* Render */
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchCity}
                onChangeText={setSearchValue}
                value={searchValue}
                placeholder="City, State or Zip Code"
                onSubmitEditing={handleSubmit}
                accessibilityLabel="Search for a city or zip code"
            />
            <Text style={styles.icon} onPress={getGeolocation}>
                ➣
            </Text>
        </View>
    );
}

/** ************************************************************** */
/* Styles */
styles = StyleSheet.create({
    container: {
        alignItems: "center",
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 30,
        maxHeight: 80,
    },
    icon: {
        fontSize: 15,
        position: "absolute",
        right: 25,
        transform: [{ rotate: "-45deg" }],
    },
    searchCity: {
        backgroundColor: "#ECEFF2",
        borderRadius: 10,
        fontSize: 15,
        height: 40,
        margin: 12,
        maxWidth: 700,
        paddingLeft: 12,
        position: "relative",
        width: "95%",
    },
});

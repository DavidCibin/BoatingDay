import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Text } from "react-native";

interface LocationSearchProps {
    location: string;
    setLocation: (location: string) => void;
    fetchByLocationHandler: (location: string) => void;
    getGeolocation: () => void;
}

const LocationSearch = ({
    location,
    setLocation,
    fetchByLocationHandler,
    getGeolocation,
}: LocationSearchProps) => {
    /*****************************************************************/
    /* State */
    const [searchValue, setSearchValue] = useState("");

    /*****************************************************************/
    /* Effects */
    useEffect(() => {
        setSearchValue(location);
    }, [location]);

    /*****************************************************************/
    /* Functions */
    const handleSubmit = () => {
        setLocation(searchValue);
        fetchByLocationHandler(searchValue);
    };

    /*****************************************************************/
    /* Render */
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchCity}
                onChangeText={setSearchValue}
                value={searchValue}
                placeholder={"City, State or Zip Code"}
                onSubmitEditing={handleSubmit}
                accessibilityLabel="Search for a city or zip code"
            />
            <Text 
                style={styles.icon}
                onPress={getGeolocation}
            >➣</Text>
        </View>
    );
};

/*****************************************************************/
/* Styles */
const styles = StyleSheet.create({
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 30,
        flexDirection: "row",
    },
    icon: {
        transform: [{ rotate: "-45deg" }],
        position: "absolute",
        right: 25,
        fontSize: 15,
    },
    searchCity: {
        height: 40,
        margin: 12,
        backgroundColor: "white",
        paddingLeft: 12,
        borderRadius: 10,
        width: "95%",
        maxWidth: 700,
        fontSize: 15,
        position: "relative",
    },
});

export default LocationSearch;

import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Button } from "react-native";

interface LocationSearchProps {
    location: string;
    setLocation: (location: string) => void;
    fetchByLocationHandler: (location: string) => void;
}

const LocationSearch = ({
    location,
    setLocation,
    fetchByLocationHandler,
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
        </View>
    );
};

/*****************************************************************/
/* Styles */
const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: 30,
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
    },
});

export default LocationSearch;

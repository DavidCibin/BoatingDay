import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Button } from "react-native";

interface ForecastSearchProps {
  location: string;
  setLocation: (location: string) => void;
  fetchByLocationHandler: (location: string) => void;
}

const ForecastSearch = ({
  location,
  setLocation,
  fetchByLocationHandler,
}: ForecastSearchProps) => {
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setSearchValue(location);
  }, [location]);

  const handleSubmit = () => {
    console.log("SEARCH VALUE: ", searchValue);
    setLocation(searchValue);
    fetchByLocationHandler(searchValue);
  };

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

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 35,
  },
  searchCity: {
    height: 50,
    margin: 12,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    width: "95%",
    maxWidth: 700,
    fontSize: 15,
  },
});

export default ForecastSearch;

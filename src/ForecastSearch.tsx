import React, {useState, useEffect} from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

const ForecastSearch = ({
  // toggleSearch,
  // setToggleSearch,
  location,
  setLocation,
  // fetchLatLongHandler,
  fetchByLocationHandler,
  // setPostalCode,
  // postalCode,
}) => {
  const [searchValue, setSetsearchValue] = useState("");
  const handleSubmit = () => {
    console.log("SEARCH VALUE: ", searchValue);
    
    setLocation(searchValue)
    fetchByLocationHandler(searchValue);
    
    // if (toggleSearch === "city") {
    //   fetchLatLongHandler();
    // }
    // if (toggleSearch === "postal") {
    //   fetchByPostalHandler();
    // }
  };

  // const setToggleByCity = () => {
  //   setToggleSearch("city");
  // };

  // const setToggleByPostal = () => {
  //   setToggleSearch("postal");
  // };

  useEffect(() => {
    setSetsearchValue(location);
  }, [location]);

  return (
    <View style={styles.container}>
      {/* <View style={styles.searchBy}>
        <Text style={styles.buttonLabel}>Search By</Text>
        <Text
          style={[styles.cityOrZip, { color: toggleSearch === "city" ? "white" : "rgba(255, 255, 255, 0.6)" }]}
          accessibilityLabel="Search Weather By City"
          onPress={setToggleByCity}
        >
          City
        </Text>
        <Text
          style={[styles.cityOrZip, { color: toggleSearch === "city" ? "rgba(255, 255, 255, 0.6)" : "white" }]}
          accessibilityLabel="Search Weather By ZIP/Postal Code"
          onPress={setToggleByPostal}
        >
          Zip Code
        </Text>
      </View> */}

      <TextInput
        style={styles.searchCity}
        onChangeText={setSetsearchValue}
        value={searchValue}
        placeholder={"City, State or Zip Code"}
        onSubmitEditing={handleSubmit}
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
  cityOrZip: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  searchBy: {
    flexDirection: "row",
    color: "white",
    marginTop: 10,
    alignItems: "center",
    justifyContent: "flex-start",
    width: "95%",
    maxWidth: 700,
  },
  buttonLabel: {
    fontSize: 12,
    color: "white",
    marginRight: 10,
  },
  searchCity: {
    height: 50,
    margin: 12,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    width: "95%",
    maxWidth: 700,
  },
});

export default ForecastSearch;

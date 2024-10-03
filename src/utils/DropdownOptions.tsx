import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

interface Props {
  nearbyStations: any[];
  fetchTideData: (station: string) => void;
}

const DropdownOptions = ({ nearbyStations, fetchTideData }: Props) => {
  const [open, setOpen] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [items, setItems] = useState(
    nearbyStations.map((station) => ({
      label: station.name,
      value: station.id,
    }))
  );

  // Handles change event
  const handleChange = (stationId: string | null) => {
    setSelectedStationId(stationId);
    if (stationId) {
      fetchTideData(stationId);
    }
  };

  useEffect(() => {

    if (!nearbyStations.length) return;
    fetchTideData(nearbyStations[0].id);
  }, [nearbyStations]);

  return (
    <View style={styles.container}>
      <DropDownPicker
        open={open}
        value={selectedStationId}
        items={items}
        setOpen={setOpen}
        setValue={setSelectedStationId}
        onChangeValue={handleChange}
        setItems={setItems}
        placeholder="Select a station"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    marginTop: 20,
  },
  dropdown: {
    backgroundColor: "#fafafa",
  },
  dropdownContainer: {
    backgroundColor: "#fafafa",
  },
});

export default DropdownOptions;

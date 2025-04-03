import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
} from "react-native";

interface Station {
    id: string;
    name: string;
}

interface DropdownProps {
    nearbyStations: Station[];
    fetchTideData: (stationId: string) => void;
    setStationName: (stationName: string) => void;
}

const DropdownMenu = ({
    nearbyStations,
    fetchTideData,
    setStationName,
}: DropdownProps) => {
    /*****************************************************************/
    /* State */
    const [isOpen, setIsOpen] = useState(false);
    const [selectedStationId, setSelectedStationId] = useState<string | null>(
        nearbyStations[0].id
    );

    /*****************************************************************/
    /* Functions */
    const handleSelectStation = (stationId: string, stationName: string) => {
        setSelectedStationId(stationId);
        setStationName(stationName);
        fetchTideData(stationId);
        setIsOpen(false);
    };

    /*****************************************************************/
    /* Effects */
    useEffect(() => {
        setStationName(nearbyStations[0].name);
        setSelectedStationId(nearbyStations[0].id);
    }, [nearbyStations]);

    /*****************************************************************/
    /* Render */
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setIsOpen(!isOpen)}
            >
                <Text style={styles.dropdownText}>Select a nearby station</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {isOpen && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={isOpen}
                    onRequestClose={() => setIsOpen(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        onPress={() => setIsOpen(false)}
                    >
                        <View style={styles.modalContainer}>
                            <FlatList
                                data={nearbyStations}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.item}
                                        onPress={() =>
                                            handleSelectStation(item.id, item.name)
                                        }
                                    >
                                        <Text style={styles.itemCheckmark}>
                                            {item.id === selectedStationId
                                                ? "✔"
                                                : ""}
                                        </Text>
                                        <Text style={styles.itemText}>
                                            {item.name}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}
        </View>
    );
};

/*****************************************************************/
/* Styles */
const styles = StyleSheet.create({
    container: {
        paddingVertical: 25,
        paddingHorizontal: 10,
        width: "100%",
    },
    dropdown: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: 40,
        backgroundColor: "#ECEFF2",
        paddingHorizontal: 15,
        borderRadius: 10,
        maxWidth: 700,
    },
    dropdownText: {
        fontSize: 15,
    },
    dropdownArrow: {
        fontSize: 14,
        paddingTop: 1,
        opacity: 0.7,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "95%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        maxHeight: "60%",
    },
    item: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        borderBottomWidth: 1,
        borderColor: "#e9e9e9",
    },
    itemCheckmark: {
        width: 30,
        fontSize: 10,
    },
    itemText: {
        color: "#333",
    },
});

export default DropdownMenu;

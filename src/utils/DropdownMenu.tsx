import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
    Animated,
} from "react-native";

/** ************************************************************** */
/* Types */
interface Station {
    id: number;
    name: string;
}
interface DropdownProps {
    nearbyStations: Station[];
    fetchTideData: (stationId: number) => void;
    setStationName: (stationName: string) => void;
}

/** ************************************************************** */
/* Variables */
let styles: ReturnType<typeof StyleSheet.create>;

/** ************************************************************** */
/* DropdownMenu Component */
export default function DropdownMenu({
    nearbyStations,
    fetchTideData,
    setStationName,
}: DropdownProps): React.JSX.Element {
    /** ************************************************************** */
    /* State */
    const [isOpen, setIsOpen] = useState(false);
    const [selectedStationId, setSelectedStationId] = useState<number>(
        nearbyStations[0].id,
    );
    const fadeAnim = useRef(new Animated.Value(0)).current;

    /** ************************************************************** */
    /* Functions */
    const handleSelectStation = (stationId: number, stationName: string) => {
        setSelectedStationId(stationId);
        setStationName(stationName);
        fetchTideData(stationId);
        setIsOpen(false);
    };

    const handleOpen = () => {
        setIsOpen(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    /** ************************************************************** */
    /* Effects */
    useEffect(() => {
        setStationName(nearbyStations[0].name);
        setSelectedStationId(nearbyStations[0].id);
    }, [nearbyStations, setStationName]);

    useEffect(() => {
        if (!isOpen) fadeAnim.setValue(0); // Reset on close
    }, [fadeAnim, isOpen]);

    /** ************************************************************** */
    /* Render */
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.dropdown}
                onPress={handleOpen}
                accessibilityLabel="Open station dropdown"
            >
                <Text style={styles.dropdownText}>Select Nearby Station</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {isOpen && (
                <Modal
                    transparent
                    animationType="slide"
                    visible={isOpen}
                    onRequestClose={() => setIsOpen(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setIsOpen(false)}
                    >
                        <Animated.View
                            style={[
                                styles.modalContainer,
                                { opacity: fadeAnim },
                            ]}
                        >
                            <FlatList
                                data={nearbyStations}
                                keyExtractor={(item) => String(item.id)}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.item}
                                        onPress={() =>
                                            handleSelectStation(
                                                item.id,
                                                item.name,
                                            )
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
                        </Animated.View>
                    </TouchableOpacity>
                </Modal>
            )}
        </View>
    );
}

/* ************************************************************** */
/* Styles */
styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    dropdown: {
        alignItems: "center",
        backgroundColor: "#ECEFF2",
        borderRadius: 10,
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        maxHeight: 40,
        paddingHorizontal: 15,
    },
    dropdownArrow: {
        fontSize: 14,
        opacity: 0.7,
        paddingTop: 1,
    },
    dropdownText: {
        fontSize: 15,
    },
    item: {
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "#e9e9e9",
        flexDirection: "row",
        padding: 8,
    },
    itemCheckmark: {
        fontSize: 10,
        width: 30,
    },
    itemText: {
        color: "#333",
    },
    modalContainer: {
        backgroundColor: "white",
        borderRadius: 10,
        maxHeight: "60%",
        padding: 20,
        width: "95%",
    },
    modalOverlay: {
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        flex: 1,
        justifyContent: "center",
    },
});

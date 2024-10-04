import React from "react";
import { View, Dimensions } from "react-native";
import LottieView from "lottie-react-native";
import waveAnimation from "../assets/json/waves.json";

const { width, height } = Dimensions.get("window");
const animationSize = 1; // Adjust this percentage as needed

const WaveAnimation = () => {
    /*****************************************************************/
    /* Constants */
    const animationWidth = width * animationSize;
    const animationHeight = height * animationSize;

    /*****************************************************************/
    /* Render */
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#172f46",
            }}
        >
            <LottieView
                source={waveAnimation}
                autoPlay
                loop
                style={{ height: animationHeight, width: animationWidth }}
            />
        </View>
    );
};

export default WaveAnimation;

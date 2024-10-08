# BoatingDay

## Overview
**BoatingDay** is a mobile app that helps users stay informed about the current weather and ocean tides based on their location. Whether you're planning a day out on the water or need up-to-date tidal data for a specific coastal area, BoatingDay offers a simple and user-friendly solution to access this information quickly.

## Features and Functionality
- **Location-based Weather & Tides:** The app uses the phone's GPS to get the user's current location and fetch weather data and ocean tides specific to that area.
- **Tidal Graphs:** Displays high and low tide points, with corresponding times for the peak points.
- **Search Functionality:** Users can search for any location (e.g., "Boston, MA") and get current weather data and today's tides for the nearest station.
- **Station Selection:** In addition to the nearest station, users can select other tide stations within a 30 miles radius of their location to view tide data.

## Installation and Setup
1. Clone the repository and navigate to the project directory.
2. Run `npm install` to install the dependencies or `npx install` if you have npx installed.
3. Start the app with `npm start` or `npx start`.

There are no required API keys or environment variables needed for running the app.

## Technologies Used
- **React Native**: For building the app's mobile interface.
- **Axios**: For fetching weather and tide data from external APIs.

## Usage Instructions
- On launch, the app automatically detects your location and fetches the current weather and tidal information.
- You can manually search for a location by entering a city name (e.g., "Boston, MA").
- View high/low tide points, represented in both time and feet, on a tide graph. 
- Switch between nearby tide stations within a 50km radius for detailed local tide information.

## Contribution Guidelines
Feel free to submit issues or pull requests to improve the app. We're always open to contributions that can enhance the user experience or optimize the app's performance.

## Screenshots
![Screenshot_20241008_112215_Expo Go](https://github.com/user-attachments/assets/ee695691-649e-43f7-9178-eda7b28bad73)
![Screenshot_20241008_105820_Expo Go](https://github.com/user-attachments/assets/75f6f5a9-35e3-4750-912c-6aabb76a60b9)
![Screenshot_20241008_105845_Expo Go](https://github.com/user-attachments/assets/f9743338-b010-4b39-a786-cce7cd3c2e30)


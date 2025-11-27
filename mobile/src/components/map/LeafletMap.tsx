import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface Marker {
    id: string;
    lat: number;
    lng: number;
    title?: string;
    price?: string;
}

interface LeafletMapProps {
    markers?: Marker[];
    initialRegion?: {
        lat: number;
        lng: number;
        zoom: number;
    };
    editable?: boolean;
    onRegionChange?: (region: { lat: number; lng: number }) => void;
    onMarkerPress?: (markerId: string) => void;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
    markers = [],
    initialRegion = { lat: 10.762622, lng: 106.660172, zoom: 13 }, // Default to HCMC
    editable = false,
    onRegionChange,
    onMarkerPress,
}) => {
    const webViewRef = useRef<WebView>(null);

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
        .custom-marker {
            width: 34px;
            height: 34px;
            background: linear-gradient(135deg, #FF385C 0%, #E61E4D 100%);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid #000000;
            box-shadow: 0 4px 8px rgba(0,0,0,0.4);
            margin-top: -34px;
            margin-left: -17px;
            position: relative;
        }
        .custom-marker::after {
            content: '';
            width: 12px;
            height: 12px;
            background-color: white;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${initialRegion.lat}, ${initialRegion.lng}], ${initialRegion.zoom});
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        var markers = [];
        var currentMarker = null;

        // Function to update markers from React Native
        function updateMarkers(newMarkers) {
            // Clear existing markers
            markers.forEach(m => map.removeLayer(m));
            markers = [];

            var customIcon = L.divIcon({
                className: 'custom-marker',
                iconSize: [34, 34],
                iconAnchor: [17, 34]
            });

            newMarkers.forEach(m => {
                var marker = L.marker([m.lat, m.lng], { icon: customIcon })
                    .addTo(map)
                    .on('click', function() {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerPress', id: m.id }));
                    });
                markers.push(marker);
            });
        }

        // Initial markers
        updateMarkers(${JSON.stringify(markers)});

        // Editable mode (Pick Location)
        if (${editable}) {
            var centerIcon = L.divIcon({
                className: 'custom-marker',
                iconSize: [34, 34],
                iconAnchor: [17, 34]
            });
            
            var centerMarker = L.marker(map.getCenter(), { icon: centerIcon, zIndexOffset: 1000 }).addTo(map);

            map.on('move', function() {
                var center = map.getCenter();
                centerMarker.setLatLng(center);
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'regionChange', lat: center.lat, lng: center.lng }));
            });

            map.on('moveend', function() {
                var center = map.getCenter();
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'regionChangeEnd', lat: center.lat, lng: center.lng }));
            });
        }

        // Listen for messages from React Native
        document.addEventListener('message', function(event) {
            var data = JSON.parse(event.data);
            if (data.type === 'updateMarkers') {
                updateMarkers(data.markers);
            }
        });
      </script>
    </body>
    </html>
  `;

    useEffect(() => {
        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({ type: 'updateMarkers', markers }));
        }
    }, [markers]);

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'markerPress' && onMarkerPress) {
                onMarkerPress(data.id);
            } else if (data.type === 'regionChange' && onRegionChange) {
                onRegionChange({ lat: data.lat, lng: data.lng });
            } else if (data.type === 'regionChangeEnd' && onRegionChange) {
                // Optional: Handle drag end specifically if needed
                onRegionChange({ lat: data.lat, lng: data.lng });
            }
        } catch (error) {
            console.error('Error parsing map message:', error);
        }
    };

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                source={{ html: htmlContent }}
                style={styles.map}
                onMessage={handleMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color="#FF385C" />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        flex: 1,
    },
});

export default LeafletMap;

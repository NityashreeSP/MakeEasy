import { useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";

function ChangeMapView({ center }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, 13);
    }, [center, map]);

    return null;
}

function Map({ position = [12.9716, 77.5946] }) {
    return (
        <MapContainer
            center={position}
            zoom={13}
            scrollWheelZoom={true}
            style={{
                height: "600px",
                width: "100%",
                borderRadius: "12px",
            }}
        >
            <ChangeMapView center={position} />

            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={position}>
                <Popup>
                    📍 Selected Location
                </Popup>
            </Marker>
        </MapContainer>
    );
}

export default Map;
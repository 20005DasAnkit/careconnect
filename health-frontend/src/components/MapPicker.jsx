import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition({
                lat: e.latlng.lat,
                lng: e.latlng.lng,
            });
        },
    });

    if (!position) return null;

    return <Marker position={[position.lat, position.lng]} />;
}

export default function MapPicker({
    currentLocation,
    destination,
    setDestination,
}) {
    return (
        <MapContainer
            center={[
                currentLocation?.lat || 22.5726,
                currentLocation?.lng || 88.3639,
            ]}
            zoom={14}
            style={{
                height: "420px",
                width: "100%",
                borderRadius: "18px",
            }}
        >
            <TileLayer
                attribution="© OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LocationMarker
                position={destination}
                setPosition={setDestination}
            />
        </MapContainer>
    );
}
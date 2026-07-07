import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    useMapEvents,
} from "react-leaflet";
import api from "../api/axios";
import { Search } from "lucide-react";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

function LocationMarker({
    position,
    setPosition,
    setAddress,
}) {
    useMapEvents({
        async click(e) {

            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            setPosition({
                lat,
                lng,
            });

            if (setAddress) {
                try {

                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
                    );

                    const data = await res.json();

                    setAddress(
                        data.display_name || ""
                    );

                } catch {
                    setAddress("");
                }
            }
        },
    });

    if (!position) return null;

    return (
        <Marker
            position={[
                position.lat,
                position.lng,
            ]}
        />
    );
}

function ChangeView({ position }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.setView([position.lat, position.lng], 16);
        }
    }, [position, map]);

    return null;
}

export default function MapPicker({
    currentLocation,
    destination,
    setDestination,
    setAddress,
}) {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (search.length < 3) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setSearching(true);

                const res = await api.get(
                    `/maps/search?q=${encodeURIComponent(search)}`
                );

                setResults(res.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const center = destination ||
        currentLocation || {
            lat: 22.5726,
            lng: 88.3639,
        };

    return (
        <div className="space-y-4">

            {/* Search */}
            <div className="relative">

                <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search pickup location..."
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#16332B]"
                />

                {searching && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border rounded-xl p-3 text-sm shadow">
                        Searching...
                    </div>
                )}

                {results.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg max-h-64 overflow-y-auto z-[9999]">

                        {results.map((item, index) => (

                            <button
                                key={index}
                                type="button"
                                className="w-full text-left p-3 hover:bg-gray-100 border-b last:border-b-0"
                                onClick={() => {

                                    const loc = {
                                        lat: parseFloat(item.lat),
                                        lng: parseFloat(item.lon),
                                    };

                                    setDestination(loc);

                                    setSearch(item.display_name);

                                    if (setAddress) {
                                        setAddress(item.display_name);
                                    }

                                    setResults([]);

                                }}
                            >
                                {item.display_name}
                            </button>

                        ))}

                    </div>
                )}

            </div>

            {/* Map */}

            <MapContainer
                center={[center.lat, center.lng]}
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

                <ChangeView position={destination} />

<LocationMarker
    position={destination}
    setPosition={setDestination}
    setAddress={setAddress}
/>
            </MapContainer>

        </div>
    );
}
import { useEffect, useRef, useState } from 'react';
import { Modal, Input, List, Button, Space } from 'antd';
import L from 'leaflet';
interface SelectedLocation {
    lat: number;
    lng: number;
    city: string;
    country: string;
    region: string;
    displayName: string;
}






interface Props {
    open: boolean;
    initialLat?: number;
    initialLng?: number;
    onCancel: () => void;
    onSelect: (location: SelectedLocation) => void;
}

interface SearchResult {
    display_name: string;
    lat: string;
    lon: string;
}

export default function LocationPickerModal({
    open,
    initialLat,
    initialLng,
    onCancel,
    onSelect,
}: Props) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    const [search, setSearch] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selected, setSelected] = useState<SelectedLocation>();
    

    // Create map once
    useEffect(() => {
        if (!open || !mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current).setView(
            [initialLat ?? 20, initialLng ?? 0],
            initialLat ? 12 : 2
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        map.on('click', (e) => {
            placeMarker(e.latlng.lat, e.latlng.lng);
        });

        mapRef.current = map;

        setTimeout(() => map.invalidateSize(), 100);
    }, [open]);

    useEffect(() => {
        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    const placeMarker = async (lat: number, lng: number) => {
        if (!mapRef.current) return; if (markerRef.current) { markerRef.current.remove(); }
        const marker = L.marker([lat, lng], { draggable: true, }).addTo(mapRef.current);

        marker.on('dragend', async () => { 
            
            const pos = marker.getLatLng(); 
            const location = await reverseGeocode(pos.lat, pos.lng); 
            setSelected(location); }); 
            markerRef.current = marker; 
            mapRef.current.flyTo([lat, lng], 13); 
            
            const location = await reverseGeocode(lat, lng); setSelected(location);
    };

    const searchPlaces = async () => {
        if (!search.trim()) return;

        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                search
            )}&limit=5`
        );

        const data = await res.json();

        setResults(data);
    };



    async function reverseGeocode(lat: number, lng: number) {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );

        const data = await response.json();

        const address = data.address ?? {};

        return {
            lat,
            lng,
            city:
                address.city ??
                address.town ??
                address.village ??
                address.hamlet ??
                '',
            region:
                address.state ??
                address.county ??
                '',
            country: address.country ?? '',
            displayName: data.display_name ?? '',
        };
    }



    const chooseResult = (result: SearchResult) => {
        placeMarker(
            Number(result.lat),
            Number(result.lon)
        );

        setResults([]);
        setSearch(result.display_name);
    };

    return (
        <Modal
  open={open}
  title="Pick Location"
  width={900}
  onCancel={onCancel}
  footer={[
    <Button key="cancel" onClick={onCancel}>
      Cancel
    </Button>,
    <Button
      key="select"
      type="primary"
      disabled={!selected}
      onClick={() => {
        if (!selected) return;
        onSelect(selected);
      }}
    >
      Use Location
    </Button>,
  ]}
>
            <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
                <Input
                    placeholder="Search city or address..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onPressEnter={searchPlaces}
                />

                <Button type="primary" onClick={searchPlaces}>
                    Search
                </Button>
            </Space.Compact>

            {results.length > 0 && (
                <List
                    bordered
                    size="small"
                    style={{ marginBottom: 12 }}
                    dataSource={results}
                    renderItem={(item) => (
                        <List.Item
                            style={{ cursor: 'pointer' }}
                            onClick={() => chooseResult(item)}
                        >
                            {item.display_name}
                        </List.Item>
                    )}
                />
            )}

            <div
                ref={mapContainerRef}
                style={{
                    height: 500,
                    width: '100%',
                    borderRadius: 8,
                    overflow: 'hidden',
                }}
            />

            {selected && (
                <div style={{ marginTop: 12 }}>
                    <strong>Latitude:</strong> {selected.lat.toFixed(6)}
                    <br />
                    <strong>Longitude:</strong> {selected.lng.toFixed(6)}
                </div>
            )}
        </Modal>
    );
}
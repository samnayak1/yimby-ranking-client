import { useEffect, useRef, useState } from 'react';
import { Modal, Input, List, Button, Space } from 'antd';
import L from 'leaflet';
import { getCountryName } from '../../utils/countries.utils';
import { useIsMobile } from '../../hooks/useIsMobile';
import { responsiveModalProps } from '../../utils/responsive.utils';
interface SelectedLocation {
    lat: number;
    lng: number;
    city: string;
    countryCode: string;
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
    const isMobile = useIsMobile();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    const [search, setSearch] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selected, setSelected] = useState<SelectedLocation>();


    // Create map once
    useEffect(() => {
        if (!open || !mapContainerRef.current) return;

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

        if (initialLat && initialLng) {
            placeMarker(initialLat, initialLng);
        }

        setTimeout(() => map.invalidateSize(), 100);

        return () => {
            markerRef.current?.remove();
            markerRef.current = null;

            map.remove();
            mapRef.current = null;
        };
    }, [open]);

    const placeMarker = async (lat: number, lng: number) => {
        const map = mapRef.current;

        if (!map) return;

        markerRef.current?.remove();

        const marker = L.marker([lat, lng], {
            draggable: true,
        }).addTo(map);

        markerRef.current = marker;

        map.flyTo([lat, lng], 13);

        const location = await reverseGeocode(lat, lng);

        setSelected(location);

        marker.on('dragend', async () => {
            const pos = marker.getLatLng();

            const updated = await reverseGeocode(pos.lat, pos.lng);

            setSelected(updated);
        });
    };
    const searchPlaces = async () => {
        if (!search.trim()) return;

        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                search
            )}&limit=5`
        );

        const data: SearchResult[] = await res.json();

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
            countryCode: address.country_code ?? '',
            displayName: data.display_name ?? '',
        };
    }



    const chooseResult = async (result: SearchResult) => {
        await placeMarker(
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
            {...responsiveModalProps(isMobile, 900)}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel} block={isMobile}>
                    Cancel
                </Button>,
                <Button
                    key="select"
                    type="primary"
                    block={isMobile}
                    className={isMobile ? 'ml-0 mt-2' : undefined}
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
                    style={{ marginBottom: 12, maxHeight: 200, overflowY: 'auto' }}
                    dataSource={results}
                    renderItem={(item) => (
                        <List.Item
                            style={{ cursor: 'pointer', fontSize: 14, wordBreak: 'break-word' }}
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
                    height: isMobile ? 320 : 500,
                    width: '100%',
                    borderRadius: 8,
                    overflow: 'hidden',
                }}
            />

            {selected && (
                <div style={{ marginTop: 12, fontSize: 14, wordBreak: 'break-word' }}>
                    <strong>City:</strong> {selected.city || '—'}
                    <br />

                    <strong>Region:</strong> {selected.region || '—'}
                    <br />

                    <strong>Country:</strong> {getCountryName(selected.countryCode) || '—'}
                    <br />

                    <strong>Latitude:</strong> {selected.lat.toFixed(6)}
                    <br />

                    <strong>Longitude:</strong> {selected.lng.toFixed(6)}
                </div>
            )}
        </Modal>
    );
}
import React, { useState } from "react";
import { Issue, IssueCategory, LocationCoordinates } from "../types";
import { MAP_CENTER } from "../data/mockIssues";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import {
  AlertTriangle,
  Droplet,
  Lightbulb,
  Trash2,
  Building,
  HelpCircle,
} from "lucide-react";
import { renderToString } from "react-dom/server";

interface IssueMapProps {
  issues: Issue[];
  selectedCategory: string;
  selectedStatus: string;
  onSelectIssue: (issue: Issue) => void;
  selectedIssueId?: string | null;
  interactiveMode?: boolean;
  onSelectLocation?: (coords: LocationCoordinates) => void;
  pinnedLocation?: LocationCoordinates | null;
  centerLocation?: Pick<LocationCoordinates, "lat" | "lng"> | null;
  currentLocation?: LocationCoordinates | null;
  onLocateCurrent?: (
    shouldSetCenter?: boolean,
  ) => Promise<LocationCoordinates | null>;
  routeData?: { lat: number; lng: number }[] | null;
  className?: string;
}

function MapEvents({
  interactiveMode,
  onSelectLocation,
}: {
  interactiveMode: boolean;
  onSelectLocation?: (coords: LocationCoordinates) => void;
}) {
  useMapEvents({
    click(e) {
      if (!interactiveMode || !onSelectLocation) return;
      const { lat, lng } = e.latlng;
      const address = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
      onSelectLocation({ lat, lng, address });
    },
  });
  return null;
}

const createCustomIcon = (status: string, isSelected: boolean) => {
  let color = "bg-slate-500 border-white";
  if (status === "Reported") color = "bg-red-500 border-white";
  else if (status === "Verified") color = "bg-amber-500 border-white";
  else if (status === "In Progress") color = "bg-blue-500 border-white";
  else if (status === "Resolved") color = "bg-emerald-500 border-white";

  const scale = isSelected ? "scale-125 ring-2 ring-indigo-500" : "scale-100";

  const html = `
    <div class="w-6 h-6 rounded-full border-2 shadow-md flex items-center justify-center transition-transform ${scale} ${color}">
      <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const pinnedIcon = L.divIcon({
  html: `
    <div class="w-5 h-5 rounded-full bg-indigo-500 border-2 border-white shadow-lg animate-bounce"></div>
  `,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 20],
});

const currentLocationIcon = L.divIcon({
  html: `
    <div class="current-location-marker">
      <span class="current-location-label">You are here</span>
      <span class="current-location-dot"></span>
    </div>
  `,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function LocateControl({
  currentLocation,
  onLocateCurrent,
}: {
  currentLocation?: LocationCoordinates | null;
  onLocateCurrent?: (
    shouldSetCenter?: boolean,
  ) => Promise<LocationCoordinates | null>;
}) {
  const map = useMap();

  React.useEffect(() => {
    const Control = L.Control.extend({
      onAdd() {
        const button = L.DomUtil.create(
          "button",
          "leaflet-bar leaflet-control leaflet-control-locate",
        );
        button.type = "button";
        button.title = "Locate me";
        button.setAttribute("aria-label", "Locate me");
        button.innerHTML = `
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        `;

        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.on(button, "click", async (event) => {
          L.DomEvent.preventDefault(event);
          button.classList.add("is-locating");

          try {
            const nextLocation = onLocateCurrent
              ? await onLocateCurrent(false)
              : currentLocation;
            if (nextLocation) {
              map.flyTo([nextLocation.lat, nextLocation.lng], 17, {
                duration: 1,
              });
            }
          } finally {
            button.classList.remove("is-locating");
          }
        });

        return button;
      },
    });

    const control = new Control({ position: "topleft" });
    control.addTo(map);

    return () => {
      control.remove();
    };
  }, [currentLocation, map, onLocateCurrent]);

  return null;
}

function UpdateCenter({
  centerLat,
  centerLng,
  routeData,
}: {
  centerLat: number;
  centerLng: number;
  routeData?: { lat: number; lng: number }[] | null;
}) {
  const map = useMap();
  React.useEffect(() => {
    if (routeData && routeData.length > 0) {
      const bounds = L.latLngBounds(routeData.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      const currentCenter = map.getCenter();
      if (
        Math.abs(currentCenter.lat - centerLat) > 0.0001 ||
        Math.abs(currentCenter.lng - centerLng) > 0.0001
      ) {
        map.flyTo([centerLat, centerLng], map.getZoom(), { duration: 1 });
      }
    }
  }, [centerLat, centerLng, routeData, map]);
  return null;
}

export default function IssueMap({
  issues,
  selectedCategory,
  selectedStatus,
  onSelectIssue,
  selectedIssueId,
  interactiveMode = false,
  onSelectLocation,
  pinnedLocation,
  centerLocation,
  currentLocation,
  onLocateCurrent,
  routeData,
  className,
}: IssueMapProps) {
  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    if (
      selectedCategory &&
      selectedCategory !== "All" &&
      issue.category !== selectedCategory
    )
      return false;
    if (
      selectedStatus &&
      selectedStatus !== "All" &&
      issue.status !== selectedStatus
    )
      return false;
    return true;
  });

  const centerLat = centerLocation?.lat ?? MAP_CENTER.lat;
  const centerLng = centerLocation?.lng ?? MAP_CENTER.lng;

  const getCategoryIcon = (category: IssueCategory) => {
    switch (category) {
      case "Pothole":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "Water Leakage":
        return <Droplet className="w-4 h-4 text-blue-500" />;
      case "Damaged Streetlight":
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case "Waste Management":
        return <Trash2 className="w-4 h-4 text-emerald-500" />;
      case "Public Infrastructure":
        return <Building className="w-4 h-4 text-purple-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Reported":
        return "bg-red-500 border-red-700 ring-red-200";
      case "Verified":
        return "bg-amber-500 border-amber-700 ring-amber-200";
      case "In Progress":
        return "bg-blue-500 border-blue-700 ring-blue-200";
      case "Resolved":
        return "bg-emerald-500 border-emerald-700 ring-emerald-200";
      default:
        return "bg-slate-500 border-slate-700 ring-slate-200";
    }
  };

  return (
    <div className={`relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner z-0 ${className || "h-[500px]"}`}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <UpdateCenter
          centerLat={centerLat}
          centerLng={centerLng}
          routeData={routeData}
        />
        <LocateControl
          currentLocation={currentLocation}
          onLocateCurrent={onLocateCurrent}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEvents
          interactiveMode={interactiveMode}
          onSelectLocation={onSelectLocation}
        />

        {filteredIssues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.location.lat, issue.location.lng]}
            icon={createCustomIcon(issue.status, selectedIssueId === issue.id)}
            eventHandlers={{
              click: () => onSelectIssue(issue),
            }}
          >
            <Popup offset={[0, -10]}>
              <div className="min-w-[200px]">
                <div className="flex gap-1.5 items-center font-semibold text-slate-800 line-clamp-1 mb-1">
                  {getCategoryIcon(issue.category)}
                  <span className="text-sm">{issue.title}</span>
                </div>
                <p className="text-slate-600 text-xs line-clamp-2 mb-2">
                  {issue.description}
                </p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${getStatusColor(
                        issue.status,
                      )}`}
                    ></span>
                    {issue.status}
                  </span>
                  <span className="font-semibold text-indigo-600">
                    XP:{" "}
                    {issue.priority === "Critical"
                      ? 150
                      : issue.priority === "High"
                        ? 100
                        : 50}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {pinnedLocation && (
          <Marker
            position={[pinnedLocation.lat, pinnedLocation.lng]}
            icon={pinnedIcon}
          />
        )}

        {currentLocation && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={currentLocationIcon}
            zIndexOffset={1000}
          />
        )}

        {routeData && routeData.length > 0 && (
          <Polyline
            positions={routeData.map((p) => [p.lat, p.lng])}
            color="#4f46e5"
            weight={4}
            dashArray="10, 10"
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  );
}

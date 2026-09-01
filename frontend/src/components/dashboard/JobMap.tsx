import {
  MapPinIcon,
} from "@heroicons/react/24/outline";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { useNavigate } from "react-router-dom";

import type { Job } from "@/shared/types/job";

/* Fix Leaflet marker */

delete (
  L.Icon.Default.prototype as unknown as {
    _getIconUrl?: unknown;
  }
)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type JobMapProps = {
  jobs: Job[];
};

const formatBudget = (budget: string | number) => {
  const amount = Number(budget);

  if (Number.isNaN(amount)) {
    return `K${budget}`;
  }

  return `K${amount.toLocaleString()}`;
};

const JobMap = ({ jobs }: JobMapProps) => {
  const navigate = useNavigate();

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

      <div className="h-[600px] w-full">

        <MapContainer
          center={[-15.4167, 28.2833]}
          zoom={12}
          scrollWheelZoom={true}
          className="h-full w-full"
        >

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {jobs.map((job) => {

            const latitude =
              Number(job.latitude);

            const longitude =
              Number(job.longitude);

            if (
              Number.isNaN(latitude) ||
              Number.isNaN(longitude)
            ) {
              return null;
            }

            return (
              <Marker
                key={job.id}
                position={[
                  latitude,
                  longitude,
                ]}
              >

                <Popup>

                  <div className="min-w-[220px]">

                    <h3 className="text-sm font-semibold text-slate-900">
                      {job.title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {job.category_name || "General"}
                    </p>

                    {job.general_location && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-slate-600">

                        <MapPinIcon className="h-3.5 w-3.5" />

                        {job.general_location}

                      </div>
                    )}

                    <p className="mt-2 text-sm font-bold text-emerald-600">
                      {formatBudget(job.budget)}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/worker/dashboard/jobs/${job.id}`
                        )
                      }
                      className="mt-3 w-full rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      View Details
                    </button>

                  </div>

                </Popup>

              </Marker>
            );
          })}

        </MapContainer>

      </div>

    </section>
  );
};

export default JobMap;
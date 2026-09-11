/** A small embedded map from lat/long — no API key needed (Google's public
 * `output=embed` query form). Renders nothing when either coordinate is
 * missing, which is most company addresses today (geolocation is opt-in). */
export function AddressMap({
  latitude,
  longitude,
  label,
  className,
}: {
  latitude: string | null | undefined;
  longitude: string | null | undefined;
  label?: string;
  className?: string;
}) {
  if (!latitude || !longitude) return null;
  const src = `https://www.google.com/maps?q=${encodeURIComponent(latitude)},${encodeURIComponent(longitude)}&z=16&output=embed`;
  return (
    <iframe
      src={src}
      loading="lazy"
      title={label ? `Map: ${label}` : "Map"}
      className={className ?? "h-40 w-full rounded-md border"}
    />
  );
}

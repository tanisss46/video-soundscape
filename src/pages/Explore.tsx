import { VideoLibrary } from "@/components/VideoLibrary";

export default function Explore() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Explore Videos</h1>
      <VideoLibrary />
    </div>
  );
}
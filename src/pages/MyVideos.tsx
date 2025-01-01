import { VideoLibrary } from "@/components/VideoLibrary";

export default function MyVideos() {
  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Videos</h1>
      <VideoLibrary />
    </div>
  );
}
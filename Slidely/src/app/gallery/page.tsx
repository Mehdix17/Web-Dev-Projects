import { GalleryClient } from "@/components/work/GalleryClient";
import { getWorks } from "@/lib/work-store";

export default async function GalleryPage() {
  const works = await getWorks();
  return <GalleryClient initialWorks={works} />;
}

import { redirect } from "next/navigation";

interface PageProps {
  params: { slug: string };
}

export default function WorkSlugRedirectPage({ params }: PageProps) {
  redirect(`/gallery/${params.slug}`);
}

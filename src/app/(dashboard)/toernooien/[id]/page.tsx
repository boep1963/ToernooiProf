import ToernooiDetailContent from './ToernooiDetailContent';

export default async function ToernooiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ToernooiDetailContent id={id} />;
}

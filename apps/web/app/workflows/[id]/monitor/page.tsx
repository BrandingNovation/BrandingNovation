import WorkflowMonitorClient from './client';

// Generate static params for static export - provide some default workflow IDs
export async function generateStaticParams() {
  return [
    { id: 'demo-1' },
    { id: 'demo-2' },
    { id: 'demo-3' },
  ];
}

interface Props {
  params: { id: string };
}

export default function WorkflowMonitorPage({ params }: Props) {
  return <WorkflowMonitorClient workflowId={params.id} />;
}
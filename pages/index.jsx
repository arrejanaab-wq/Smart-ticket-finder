import dynamic from 'next/dynamic';
const Finder = dynamic(() => import('../components/RailwaySmartFinder'), { ssr: false });

export default function Home() {
  return <Finder />;
}

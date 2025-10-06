// pages/index.tsx
import dynamic from 'next/dynamic';

// dynamically import your App component, client-side only
const App = dynamic(() => import('../components/App'), { ssr: false });

export default function HomePage() {
  return <App />;
}
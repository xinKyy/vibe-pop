import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function AppShell() {
  return (
    <div className="h-dvh w-full flex items-center justify-center bg-[#050507]">
      <div className="relative w-full max-w-[430px] h-full min-[431px]:h-[calc(100dvh-40px)] min-[431px]:max-h-[932px] bg-bg overflow-hidden min-[431px]:rounded-2xl min-[431px]:border min-[431px]:border-border/50">
        <main className="h-[calc(100%-60px)] overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

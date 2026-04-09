import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function AppShell() {
  return (
    <div className="max-w-[375px] mx-auto h-dvh bg-[var(--color-bg-primary)] relative overflow-hidden border-x border-[var(--color-border)] min-[376px]:border-x max-[375px]:border-x-0">
      <main className="h-[calc(100dvh-60px)] overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

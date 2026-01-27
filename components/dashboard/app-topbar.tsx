import { ModeToggle } from '../mode-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { SidebarTrigger } from '../ui/sidebar';

function AppTopbar() {
  return (
    <div className="flex justify-between w-full h-16 border-b flex items-center px-4">
      <SidebarTrigger />
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">John Doe</h1>
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <ModeToggle />
      </div>
    </div>
  );
}

export default AppTopbar
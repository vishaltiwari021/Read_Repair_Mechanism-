import { ShieldCheck } from "lucide-react";

function Navbar() {
  return (
    <div className="navbar bg-base-100 shadow-md rounded-box my-4 sticky top-4 z-50 border border-base-300">
      <div className="flex-1">
        <a href="#overview" className="btn btn-ghost normal-case text-xl gap-3">
          <div className="bg-primary text-primary-content p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="font-bold tracking-tight">ReadRepair</span>
            <span className="text-[0.7rem] font-medium text-base-content/60 mt-1">Mechanism System</span>
          </div>
        </a>
      </div>
      <div className="flex-none hidden md:flex">
        <ul className="menu menu-horizontal px-1 gap-1 font-medium text-base-content/80">
          <li><a href="#overview" className="hover:text-primary">Overview</a></li>
          <li><a href="#skills" className="hover:text-primary">Metrics</a></li>
          <li><a href="#workspace" className="text-primary font-semibold">Workspace</a></li>
          <li><a href="#architecture" className="hover:text-primary">Architecture</a></li>
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
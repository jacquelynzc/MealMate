import { Link, useLocation } from "wouter";
import { Home, Refrigerator, UtensilsCrossed, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/pantry", icon: Refrigerator, label: "Pantry" },
  { href: "/recipes", icon: UtensilsCrossed, label: "Recipes" },
  { href: "/scan", icon: ScanLine, label: "Scan Receipt" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-sage-50 border-r border-sage-200 p-4">
      <div className="flex items-center gap-2 mb-8">
        <UtensilsCrossed className="h-6 w-6 text-sage-700" />
        <h1 className="text-xl font-bold text-sage-900">MealMate</h1>
      </div>
      
      <nav className="space-y-2">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <a
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                "hover:bg-sage-100 hover:text-sage-900",
                location === href 
                  ? "bg-sage-200 text-sage-900" 
                  : "text-sage-700"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </a>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

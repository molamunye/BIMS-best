import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: "up" | "down" | "neutral";
}

export default function StatCard({ title, value, subtitle, change, icon: Icon, iconColor = "bg-primary", trend = "neutral" }: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
            {change && (
              <p className={cn(
                "text-xs font-medium truncate",
                trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"
              )}>
                {change}
              </p>
            )}
          </div>
          <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0", iconColor)}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  available?: boolean;
}

export const ActivityCard = ({ title, description, icon: Icon, to, available = true }: ActivityCardProps) => {
  const content = (
    <Card className={cn(
      "h-full transition-all duration-300",
      available 
        ? "cursor-pointer hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1" 
        : "opacity-60 cursor-not-allowed"
    )}>
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {available ? (
          <span className="text-sm font-medium text-primary">Click to explore →</span>
        ) : (
          <span className="text-sm font-medium text-muted-foreground">Coming soon</span>
        )}
      </CardContent>
    </Card>
  );

  return available ? <Link to={to}>{content}</Link> : content;
};

import { Badge } from "@/components/ui/badge";
import { differenceInDays } from "date-fns";

interface ExpirationBadgeProps {
  date: Date;
}

export default function ExpirationBadge({ date }: ExpirationBadgeProps) {
  const daysUntilExpiration = differenceInDays(date, new Date());
  
  if (daysUntilExpiration < 0) {
    return (
      <Badge variant="destructive">Expired</Badge>
    );
  }
  
  if (daysUntilExpiration <= 3) {
    return (
      <Badge variant="destructive">Expiring Soon</Badge>
    );
  }
  
  if (daysUntilExpiration <= 7) {
    return (
      <Badge variant="warning">Use Soon</Badge>
    );
  }
  
  return (
    <Badge variant="secondary">Fresh</Badge>
  );
}

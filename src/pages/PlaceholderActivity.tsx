import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Construction } from "lucide-react";
import { Link } from "react-router-dom";

const PlaceholderActivity = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="mb-8 max-w-2xl mx-auto">
          <Link to="/">
            <Button variant="outline" size="lg" className="font-semibold shadow-sm hover:shadow-md transition-all">
              <ArrowLeft className="mr-2 h-5 w-5" />
              ⬅ Back to Home
            </Button>
          </Link>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Construction className="w-16 h-16 text-muted-foreground mb-6" />
            <h1 className="text-3xl font-bold mb-4">Coming Soon</h1>
            <p className="text-lg text-muted-foreground mb-8">
              This activity is currently under development and will be available soon.
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Activities
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlaceholderActivity;

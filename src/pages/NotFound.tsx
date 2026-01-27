import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <DashboardLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
          </div>
          
          <h1 className="mb-3 text-4xl md:text-5xl font-bold text-foreground">
            Seite nicht gefunden
          </h1>
          
          <p className="mb-2 text-lg text-muted-foreground">
            Die angeforderte Seite konnte nicht gefunden werden.
          </p>
          
          <p className="mb-8 text-sm text-muted-foreground">
            Die URL <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{location.pathname}</span> existiert nicht oder wurde verschoben.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="min-h-[44px]">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Zur Startseite
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Möglicherweise haben Sie einen veralteten Link verwendet oder die Seite wurde entfernt.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotFound;

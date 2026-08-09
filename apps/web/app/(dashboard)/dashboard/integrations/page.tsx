import { CodeSquare } from "lucide-react";
import DashboardLayout from "../../(components)/dashboard-layout";

const Integrations = () => {
  return (
    <DashboardLayout>
      <div className="flex h-screen min-h-screen w-full flex-col items-center justify-center gap-4">
        <CodeSquare size={48} className="text-muted-foreground" />
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">
          Integrations Page
        </h1>
        <p className="text-muted-foreground">
          This page will be implemented soon.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Integrations;

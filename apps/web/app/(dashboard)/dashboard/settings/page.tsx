import React, { Suspense } from "react";
import DashboardLayout from "@/app/(dashboard)/(components)/dashboard-layout";
import SettingsSubpage from "../../(components)/settings-subpage";
import { Loader2 } from "lucide-react";

const Settings = () => {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex min-h-[400px] w-full items-center justify-center">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        }
      >
        <SettingsSubpage />
      </Suspense>
    </DashboardLayout>
  );
};

export default Settings;

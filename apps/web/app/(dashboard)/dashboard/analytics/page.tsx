import React from "react";
import DashboardLayout from "@/app/(dashboard)/(components)/dashboard-layout";
import AnalyticsDashboard from "@/app/(dashboard)/(components)/analytics-subpage";

const Analytics = () => {
  return (
    <>
      <DashboardLayout>
        <AnalyticsDashboard />
      </DashboardLayout>
    </>
  );
};

export default Analytics;

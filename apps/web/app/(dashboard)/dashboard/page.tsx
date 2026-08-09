import DashboardLayout from "../(components)/dashboard-layout";
import UserDashboard from "../(components)/user-dashboard";

const Dashboard = () => {
  return (
    <div>
      <DashboardLayout>
        <UserDashboard />
      </DashboardLayout>
    </div>
  );
};

export default Dashboard;

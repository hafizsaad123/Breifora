import "./DashboardPreview.css";
import dashboardPreviewImage from "../../assets/hero/dashboard-preview.png";


export default function DashboardPreview() {
  return (
    <div className="dashboard-preview">
      <img src={dashboardPreviewImage} alt="Dashboard Preview" className="dashboard-preview__image" />
    </div>
  );
}

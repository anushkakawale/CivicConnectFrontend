import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import PageWrapper from "../components/layout/PageWrapper";
import GovCard from "../components/ui/GovCard";
import ComplaintStatusBadge from "../components/complaint/ComplaintStatusBadge";

export default function TrackComplaint() {
  const { citizenUserId, complaintId } = useParams();
  const [complaint, setComplaint] = useState(null);

  useEffect(() => {
    api.get(`/api/citizen/complaints/${citizenUserId}/${complaintId}`)
      .then(res => setComplaint(res.data));
  }, []);

  if (!complaint) return null;

  return (
    <PageWrapper
      title="Complaint Tracking"
      subtitle="View real-time status of your complaint"
    >
      <GovCard>
        <p><b>ID:</b> {complaint.id}</p>
        <p><b>Title:</b> {complaint.title}</p>
        <p><b>Status:</b> <ComplaintStatusBadge status={complaint.status} /></p>
        <p><b>Department:</b> {complaint.departmentName}</p>
        <p><b>Last Updated:</b> {complaint.updatedAt}</p>
      </GovCard>
    </PageWrapper>
  );
}

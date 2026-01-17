import api from "../api/axiosConfig";
import PageWrapper from "../components/layout/PageWrapper";
import GovCard from "../components/ui/GovCard";
import GovInput from "../components/ui/GovInput";
import GovSelect from "../components/ui/GovSelect";
import GovButton from "../components/ui/GovButton";

export default function RegisterComplaint() {

  const submit = async (e) => {
    e.preventDefault();
    const f = e.target;

    await api.post("/api/complaints", {
      citizenUserId: f.citizenUserId.value,
      title: f.title.value,
      description: f.description.value,
      departmentId: f.departmentId.value,
      latitude: f.latitude.value,
      longitude: f.longitude.value
    });

    alert("Complaint registered successfully");
  };

  return (
    <PageWrapper
      title="Register Civic Complaint"
      subtitle="Submit civic issues for municipal action"
    >
      <GovCard>
        <form onSubmit={submit}>
          <GovInput label="Citizen User ID" name="citizenUserId" required />
          <GovInput label="Complaint Title" name="title" required />
          <GovInput label="Complaint Description" name="description" required />
          <GovInput label="Department ID" name="departmentId" required />
          <GovInput label="Latitude" name="latitude" />
          <GovInput label="Longitude" name="longitude" />
          <GovButton>Submit Complaint</GovButton>
        </form>
      </GovCard>
    </PageWrapper>
  );
}

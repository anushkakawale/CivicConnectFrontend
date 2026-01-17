import api from "../api/axiosConfig";
import PageWrapper from "../components/layout/PageWrapper";
import GovCard from "../components/ui/GovCard";
import GovInput from "../components/ui/GovInput";
import GovButton from "../components/ui/GovButton";

export default function WardOfficerRegistration() {

  const submit = async (e) => {
    e.preventDefault();
    const f = e.target;

    await api.post("/admin/register/ward-officer", {
      name: f.name.value,
      email: f.email.value,
      mobile: f.mobile.value,
      password: f.password.value,
      wardId: f.wardId.value
    });

    alert("Ward Officer created successfully");
  };

  return (
    <PageWrapper
      title="Ward Officer Registration"
      subtitle="Admin-only service for ward-level governance"
    >
      <GovCard>
        <form onSubmit={submit}>
          <GovInput label="Officer Name" name="name" required />
          <GovInput label="Official Email" name="email" required />
          <GovInput label="Mobile Number" name="mobile" required />
          <GovInput label="Temporary Password" type="password" name="password" required />
          <GovInput label="Ward ID" name="wardId" required />
          <GovButton>Create Ward Officer</GovButton>
        </form>
      </GovCard>
    </PageWrapper>
  );
}

import api from "../api/axiosConfig";
import PageWrapper from "../components/layout/PageWrapper";
import GovCard from "../components/ui/GovCard";
import GovInput from "../components/ui/GovInput";
import GovButton from "../components/ui/GovButton";

export default function DepartmentOfficerRegistration() {

  const submit = async (e) => {
    e.preventDefault();
    const f = e.target;

    await api.post("/ward-officer/register/department-officer", {
      name: f.name.value,
      email: f.email.value,
      mobile: f.mobile.value,
      password: f.password.value,
      wardId: f.wardId.value,
      departmentId: f.departmentId.value
    });

    alert("Department Officer created & complaints auto-assigned");
  };

  return (
    <PageWrapper
      title="Department Officer Registration"
      subtitle="Assign officers to departments for complaint handling"
    >
      <GovCard>
        <form onSubmit={submit}>
          <GovInput label="Officer Name" name="name" required />
          <GovInput label="Official Email" name="email" required />
          <GovInput label="Mobile Number" name="mobile" required />
          <GovInput label="Temporary Password" type="password" name="password" required />
          <GovInput label="Ward ID" name="wardId" required />
          <GovInput label="Department ID" name="departmentId" required />
          <GovButton>Create Department Officer</GovButton>
        </form>
      </GovCard>
    </PageWrapper>
  );
}

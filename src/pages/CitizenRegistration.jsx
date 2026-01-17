import api from "../api/axiosConfig";
import PageWrapper from "../components/layout/PageWrapper";
import GovCard from "../components/ui/GovCard";
import GovInput from "../components/ui/GovInput";
import GovButton from "../components/ui/GovButton";

export default function CitizenRegistration() {

  const submit = async (e) => {
    e.preventDefault();
    const f = e.target;

    await api.post("/citizens/register", {
      name: f.name.value,
      email: f.email.value,
      mobile: f.mobile.value,
      password: f.password.value,
      wardId: f.wardId.value || null
    });

    alert("Citizen registered successfully");
  };

  return (
    <PageWrapper
      title="Citizen Registration"
      subtitle="Register to access municipal services and raise complaints"
    >
      <GovCard>
        <form onSubmit={submit}>
          <GovInput label="Full Name" name="name" required />
          <GovInput label="Email Address" name="email" required />
          <GovInput label="Mobile Number" name="mobile" required />
          <GovInput label="Password" type="password" name="password" required />
          <GovInput label="Ward ID (Optional)" name="wardId" />
          <GovButton>Register Citizen</GovButton>
        </form>
      </GovCard>
    </PageWrapper>
  );
}

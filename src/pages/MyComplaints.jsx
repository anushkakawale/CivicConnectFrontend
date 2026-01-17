import { useState } from "react";
import api from "../api/axiosConfig";
import GovTable from "../components/ui/GovTable";
import ComplaintStatusBadge from "../components/complaint/ComplaintStatusBadge";

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [citizenId, setCitizenId] = useState("");

  const load = async () => {
    const res = await api.get(`/api/citizen/complaints/${citizenId}`);
    setComplaints(res.data);
  };

  return (
    <div className="page-wrapper">
      <h2>My Complaints</h2>

      <input
        placeholder="Citizen User ID"
        value={citizenId}
        onChange={(e) => setCitizenId(e.target.value)}
      />
      <button onClick={load}>Load Complaints</button>

      <GovTable headers={["ID", "Title", "Status", "Track"]}>
        {complaints.map(c => (
          <tr key={c.id}>
            <td>{c.id}</td>
            <td>{c.title}</td>
            <td><ComplaintStatusBadge status={c.status} /></td>
            <td>
              <a href={`/citizen/complaints/${citizenId}/${c.id}`}>
                Track
              </a>
            </td>
          </tr>
        ))}
      </GovTable>
    </div>
  );
}

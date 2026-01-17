export default function ComplaintStatusBadge({ status }) {
  return <span className={`status ${status}`}>{status}</span>;
}

export default function GovInput({ label, ...props }) {
  return (
    <div className="gov-field">
      <label>{label}</label>
      <input {...props} />
    </div>
  );
}

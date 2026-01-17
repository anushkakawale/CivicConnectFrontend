export default function GovSelect({ label, children, ...props }) {
  return (
    <div className="gov-field">
      <label>{label}</label>
      <select {...props}>{children}</select>
    </div>
  );
}

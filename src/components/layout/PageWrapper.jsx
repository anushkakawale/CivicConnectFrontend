export default function PageWrapper({ title, subtitle, children }) {
  return (
    <div className="page-wrapper">
      <h2>{title}</h2>
      <p className="page-subtitle">{subtitle}</p>
      {children}
    </div>
  );
}

import ServiceTiles from "../components/navigation/ServiceTiles";

export default function Home() {
  return (
    <div className="home">
      <h2>Registration Services</h2>
      <p>Select an authorised service below</p>
      <ServiceTiles />
    </div>
  );
}

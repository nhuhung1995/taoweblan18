import { AddressFlowMachine } from '@/components/AddressFlowMachine';

export default function HomePage() {
  return (
    <main style={{ maxWidth: 880, margin: '32px auto', padding: 20, background: '#fff', borderRadius: 12 }}>
      <h1 style={{ marginTop: 0 }}>Sales Address Functional Equivalence</h1>
      <p>Flow: Zipcode -&gt; Chome -&gt; Banchi -&gt; Room -&gt; Eligible Plans</p>
      <AddressFlowMachine />
    </main>
  );
}

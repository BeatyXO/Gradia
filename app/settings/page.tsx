export default function SettingsPage() {
  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm font-black uppercase text-[#6E3482]">Settings</p>
        <h1 className="text-3xl font-black text-[#49225B]">Network and Safety</h1>
      </div>
      <section className="panel grid gap-4 p-5">
        <label>
          <span className="label">GenLayer network</span>
          <select className="field" defaultValue="studionet">
            <option value="studionet">StudioNet</option>
            <option value="localnet">Localnet</option>
          </select>
        </label>
        <label>
          <span className="label">Contract address</span>
          <input className="field" defaultValue={process.env.NEXT_PUBLIC_GRADIA_CONTRACT_ADDRESS || ""} placeholder="0x..." />
        </label>
        <div className="grid gap-3 md:grid-cols-3">
          <p className="rounded-md bg-white p-3 text-sm"><strong>Storage:</strong> evidence references and hashes only</p>
          <p className="rounded-md bg-white p-3 text-sm"><strong>Wallet:</strong> injected provider identity</p>
          <p className="rounded-md bg-white p-3 text-sm"><strong>Token:</strong> GEN on StudioNet</p>
        </div>
      </section>
    </div>
  );
}

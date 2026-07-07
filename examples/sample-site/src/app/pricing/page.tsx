import { Footer } from "@/components/Footer";

export default function Pricing() {
  return (
    <main>
      <section className="px-6 py-24">
        <h1 className="text-4xl font-bold">Pricing</h1>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {["Starter", "Pro", "Team"].map((tier) => (
            <div key={tier} className="rounded border p-6">
              <h2 className="text-xl font-semibold">{tier}</h2>
              <p className="mt-2 text-gray-600">A short description.</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}

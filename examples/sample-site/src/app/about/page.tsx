import { Footer } from "@/components/Footer";

export default function About() {
  return (
    <main>
      <section className="px-6 py-24">
        <h1 className="text-4xl font-bold">About</h1>
        <p className="mt-4 text-gray-600">
          We build sample sites for testing autonomous-improvement loops.
        </p>
      </section>
      <Footer />
    </main>
  );
}

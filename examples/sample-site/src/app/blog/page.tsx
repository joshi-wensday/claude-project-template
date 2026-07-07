import { Footer } from "@/components/Footer";

export default function Blog() {
  return (
    <main>
      <section className="px-6 py-24">
        <h1 className="text-4xl font-bold">Blog</h1>
        <ul className="mt-8 space-y-6">
          {[1, 2, 3].map((n) => (
            <li key={n}>
              <h2 className="text-xl font-semibold">Post {n}</h2>
              <p className="text-gray-600">Lorem ipsum dolor sit amet.</p>
            </li>
          ))}
        </ul>
      </section>
      <Footer />
    </main>
  );
}

import { Footer } from "@/components/Footer";

export default function Contact() {
  return (
    <main>
      <section className="px-6 py-24">
        <h1 className="text-4xl font-bold">Contact</h1>
        <form className="mt-8 max-w-md space-y-4">
          <input
            className="block w-full rounded border px-3 py-2"
            placeholder="Email"
          />
          <textarea
            className="block w-full rounded border px-3 py-2"
            rows={4}
            placeholder="Message"
          />
          <button className="rounded bg-black px-6 py-2 text-white" type="button">
            Send
          </button>
        </form>
      </section>
      <Footer />
    </main>
  );
}

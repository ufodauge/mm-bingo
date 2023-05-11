import Index from "@/components/page/index";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Main Page</title>
      </Head>
      <main>
        <Index />
      </main>
    </>
  );
}

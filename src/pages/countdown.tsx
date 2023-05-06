import CountdownPage from "@/components/page/countdown";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Countdown</title>
      </Head>
      <main>
        <CountdownPage />
      </main>
    </>
  );
}

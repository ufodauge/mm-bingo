import PopoutWindow from "@/components/page/popout";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Popout</title>
      </Head>
      <main>
        <PopoutWindow />
      </main>
    </>
  );
}

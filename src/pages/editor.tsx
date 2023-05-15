import EditorPage from "@/components/page/editor";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Editor</title>
      </Head>
      <main>
        <EditorPage />
      </main>
    </>
  );
}

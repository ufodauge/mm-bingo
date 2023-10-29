import PopoutWindow from "@/components/page/popout";
import { useQuery } from "@/lib/hooks/useQuery";
import { PopoutQuery } from "@/types/query/popout";
import Head from "next/head";
import { useState } from "react";

export default function Home() {
  const [title, setTitle] = useState<string>("");
  
  useQuery<PopoutQuery>(
    (query) => {
      setTitle(query.header === "card" ? "Card" : "Popout");
    },
    {
      tasks : "0;0;0;0;0",
      lang  : "en",
      layout: "vertical",
      header: "col1",
      theme : "light",
    }
  );
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        <PopoutWindow />
      </main>
    </>
  );
}

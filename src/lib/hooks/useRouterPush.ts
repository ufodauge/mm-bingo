import { UnreadyRouterException } from "@/class/exception/unreadyRouterException";
import { useRouter } from "next/router";
import { ParsedUrlQuery, ParsedUrlQueryInput } from "querystring";

export const useRouterPush = <
  // FROM extends ParsedUrlQuery,
  TO extends string | ParsedUrlQueryInput | null | undefined
>(): [
  () => [string, ParsedUrlQuery],
  (pathname: string, query: TO, shallow?: boolean) => void
] => {
  const router = useRouter();

  return [
    () => {
      if (!router.isReady) throw new UnreadyRouterException();

      return [router.pathname, router.query];
    },
    (pathname: string, query: TO, shallow?: boolean) => {
      if (!router.isReady) throw new UnreadyRouterException();
      router.push({ pathname, query }, undefined, { shallow });
    },
  ];
};

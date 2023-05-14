import { useRouter } from 'next/router';

import { UnreadyRouterException } from '@/class/exception/unreadyRouterException';

export const useRouterPush = <
  FROM extends { [key: string]: string | number },
  TO extends { [key: string]: string | number } = FROM
>(): {
  isReady: boolean;
  getQuery: () => { pathname: string; query: FROM };
  updateQuery: (pathname: string, query: TO, shallow?: boolean) => void;
} => {
  const router = useRouter();

  return {
    isReady: router ? router.isReady : false,
    getQuery: () => {
      if (!router.isReady) throw new UnreadyRouterException();

      return { pathname: router.pathname, query: router.query as FROM };
    },
    updateQuery: (pathname: string, query: TO, shallow?: boolean) => {
      if (!router.isReady) throw new UnreadyRouterException();

      router.push({ pathname, query }, undefined, { shallow });
    },
  };
};

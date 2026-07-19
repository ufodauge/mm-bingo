export const sleep = async (ms: number) => {
  const { promise, resolve } = Promise.withResolvers<void>();

  setTimeout(() => resolve(), ms);
  await promise;
};

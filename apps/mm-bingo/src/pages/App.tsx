import { useState } from 'react';

export function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button className='btn' onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </button>
    </>
  );
}

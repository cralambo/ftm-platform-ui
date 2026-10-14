import { useState } from "react";

export function usePagination(initialSize = 10) {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(initialSize);

  const changeSize = (newSize: number) => {
    setSize(newSize);
    setPage(0);
  };

  return { page, size, setPage, changeSize };
}
import { useEffect, useRef } from 'react'

function useInfiniteScroll({ hasMore, isLoading, error, onLoadMore }) {
  const sentinelRef = useRef(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore || isLoading || error) {
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onLoadMore()
      }
    })

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [error, hasMore, isLoading, onLoadMore])

  return sentinelRef
}

export default useInfiniteScroll

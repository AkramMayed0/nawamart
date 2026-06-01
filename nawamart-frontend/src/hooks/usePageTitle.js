import { useEffect } from 'react'

const BASE = 'نوامارت'

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : BASE
    return () => { document.title = BASE }
  }, [title])
}

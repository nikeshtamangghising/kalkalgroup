'use client'

import { memo } from 'react'

interface ModalContentProps {
  children: React.ReactNode
}

const ModalContent = memo(({ children }: ModalContentProps) => {
  return <div>{children}</div>
})

ModalContent.displayName = 'ModalContent'

export default ModalContent
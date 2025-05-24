import React from 'react'
import Crop from './transform/crop'
import RotateFlip from './transform/rotate_flip'

const Transform = () => {
  return (
    <>
      <Crop />
      <RotateFlip />
    </>
  )
}

export default Transform
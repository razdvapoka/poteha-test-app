import React, { useRef, useLayoutEffect, useState } from 'react'
import { hot } from 'react-hot-loader/root'
import './app.css'
import data from './data.json'

const App = ({
  data,
  initialImgWidth,
  imgRatio
}) => {
  const [ imgWidth ] = useState(initialImgWidth)
  const [ imagesPerPage, setImagesPerPage ] = useState(0)

  const mainRef = useRef(null)

  const recalcImagesPerPage = () => {
    const {
      offsetWidth: width,
      offsetHeight: height
    } = mainRef.current
    const imagesPerRow = Math.floor(width / imgWidth)
    const imgHeight = imgWidth / imgRatio
    const rowCount = Math.floor(height / imgHeight)
    setImagesPerPage(rowCount * imagesPerRow)
  }

  useLayoutEffect(() => {
    window.addEventListener('resize', recalcImagesPerPage)
    return () => {
      window.removeEventListener('resize', recalcImagesPerPage)
    }
  })

  useLayoutEffect(recalcImagesPerPage, [ mainRef.current ])

  return (
    <div className='app'>
      <header />
      <main className='main' ref={mainRef}>
        {data.frames.slice(0, imagesPerPage).map(({ id, url }) => (
          <img
            key={id}
            className='image'
            src={url}
            width={imgWidth}
          />
        ))}
      </main>
    </div>
  )
}

App.defaultProps = {
  data,
  initialImgWidth: 300,
  imgRatio: 960 / 540 // width / height
}

export default hot(App)

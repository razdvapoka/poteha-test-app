import React, { useRef, useLayoutEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { hot } from 'react-hot-loader/root'
import './app.css'
import data from './data.json'

const App = ({
  data,
  initialImgWidth,
  imgRatio,
  match,
  history
}) => {
  const currentPage = parseInt(match.params.page) || 1
  const currentPageIndex = currentPage - 1

  const [ imgWidth ] = useState(initialImgWidth)
  const [ imagesPerPage, setImagesPerPage ] = useState(0)

  const mainRef = useRef(null)

  const recalcImagesPerPage = () => {
    const {
      offsetWidth: width,
      offsetHeight: height
    } = mainRef.current
    const firstImageIndex = imagesPerPage * currentPageIndex
    const imagesPerRow = Math.floor(width / imgWidth)
    const imgHeight = imgWidth / imgRatio
    const rowCount = Math.floor(height / imgHeight)
    const pageCount = rowCount * imagesPerRow

    // don't update if the window is too small
    if (pageCount) {
      setImagesPerPage(pageCount)

      if (data.frames.length < pageCount * currentPage) {
        history.push(`/${Math.floor(data.frames.length / pageCount) + 1}`)
      }

      // recalc current page on resize (skip this step on mount)
      if (imagesPerPage) {
        history.push(`/${Math.floor(firstImageIndex / pageCount) + 1}`)
      }
    }
  }

  useLayoutEffect(() => {
    window.addEventListener('resize', recalcImagesPerPage)
    return () => {
      window.removeEventListener('resize', recalcImagesPerPage)
    }
  })

  useLayoutEffect(recalcImagesPerPage, [ mainRef.current ])

  const pageCount = Math.ceil(data.frames.length / imagesPerPage)

  const hasNextPage = currentPage < pageCount
  const hasPrevPage = currentPage > 1
  const handleSaveClick = () => {
    console.log(data.frames[0])
  }

  return (
    <div className='app'>
      <header className='header'>
        <span>{currentPage}/{pageCount}</span>
        <div className='buttons'>
          <Link
            className={hasPrevPage ? 'button' : 'buttonDisabled'}
            to={`/${currentPage - 1}`}
            disabled={hasPrevPage}
          >
            prev
          </Link>
          {hasNextPage ? (
            <Link className='button' to={`/${currentPage + 1}`}>
              next
            </Link>
          ) : (
            <button className='button buttonSave' onClick={handleSaveClick}>
              save
            </button>
          )}
        </div>
      </header>
      <main className='main' ref={mainRef}>
        {data.frames.slice(
          currentPageIndex * imagesPerPage,
          (currentPageIndex + 1) * imagesPerPage
        ).map(({ id, url }) => (
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
  imgRatio: 300 / 177.5 // width / height
}

export default hot(App)

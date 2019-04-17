import React, { useRef, useLayoutEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { hot } from 'react-hot-loader/root'
import './app.css'
import data from './data.json'

const tail = arr => arr[arr.length - 1]
const head = arr => arr[0]
const notEmpty = arr => arr.length > 0
const isInRange = (index, range) => head(range) <= index && index <= tail(range)

const getSelectedRanges = (images) =>
  images
    .reduce((ranges, image, imageIndex) => {
      if (image.marked) {
        const closesLastRange = notEmpty(ranges) && tail(tail(ranges)) + 1 === imageIndex
        return closesLastRange
          ? ranges
            .slice(0, ranges.length - 1)
            .concat([ [ head(tail(ranges)), imageIndex ] ])
          : ranges.concat([ [ imageIndex ] ])
      } else {
        return ranges
      }
    }, [])

const isIndexSelected = (index, ranges) =>
  notEmpty(ranges.filter(range => isInRange(index, range)))

const App = ({
  data,
  initialImgWidth,
  imgRatio,
  match,
  history
}) => {
  const currentPage = parseInt(match.params.page) || 1
  const currentPageIndex = currentPage - 1

  // >> state
  const [ imgWidth ] = useState(initialImgWidth)
  const [ imagesPerPage, setImagesPerPage ] = useState(0)
  const [ selectedRanges, setSelectedRanges ] = useState(getSelectedRanges(data.frames))
  const [ selectionStartIndex, setSelectionStartIndex ] = useState(null)
  // << state

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

  // >> event handlers
  const handleImageClick = (index) => {
    if (!isIndexSelected(index, selectedRanges)) {
      if (selectionStartIndex != null && selectionStartIndex <= index) {
        const newRange = [ selectionStartIndex, index ]

        const rangesWithoutAbsorbed = selectedRanges.filter(range => !(
          head(range) > head(newRange) &&
          tail(range) < tail(newRange)
        ))
        setSelectedRanges([ ...rangesWithoutAbsorbed, newRange ])
        setSelectionStartIndex(null)
      } else {
        setSelectionStartIndex(index)
      }
    }
  }

  const handleImageRightClick = (index) => setSelectedRanges(
    selectedRanges.filter(range => !isInRange(index, range))
  )

  const handleSaveClick = () => {
    console.log({
      ...data,
      frames: data.frames.filter(
        (_, index) => isIndexSelected(index, selectedRanges)
      )
    })
  }

  const handleSelectAll = () => {
    setSelectedRanges([ [ 0, data.frames.length - 1 ] ])
  }

  const handleDeselectAll = () => {
    setSelectedRanges([ ])
  }
  // << event handlers

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

  const getImageClassName = (index) =>
    index === selectionStartIndex
      ? 'imageSelectionStart'
      : isIndexSelected(index, selectedRanges)
        ? 'imageSelected'
        : 'image'

  return (
    <div className='app'>
      <header className='header'>
        <span>{currentPage} done / {pageCount - currentPage} left</span>
        <div className='buttons'>
          <button className='button' onClick={handleSelectAll}>
            select all
          </button>
          <button className='button' onClick={handleDeselectAll}>
            deselect all
          </button>
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
        ).map(({ id, url }, imgIndex) => {
          const realImgIndex = currentPageIndex * imagesPerPage + imgIndex
          return (
            <img
              key={id}
              className={getImageClassName(realImgIndex)}
              src={url}
              width={imgWidth}
              onClick={() => handleImageClick(realImgIndex)}
              onContextMenu={(e) => {
                e.preventDefault()
                handleImageRightClick(realImgIndex)
              }}
            />
          )
        })}
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

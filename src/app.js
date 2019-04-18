import './app.css'
import React, {
  useRef,
  useLayoutEffect,
  useState
} from 'react'
import { hot } from 'react-hot-loader/root'
import data from './data.json'
import Header from './header'

const tail = arr => arr[arr.length - 1]
const head = arr => arr[0]
const notEmpty = arr => arr.length > 0
const isInRange = (index, range) => head(range) <= index && index <= tail(range)

const getSelectedRanges = (images) =>
  images
    .reduce((ranges, image, imageIndex) => {
      if (image.marked) {
        const isClosingLastRange = (
          notEmpty(ranges) &&
          tail(tail(ranges)) + 1 === imageIndex
        )
        return isClosingLastRange
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
  initialImageWidth,
  gridGap,
  imageRatio,
  maxImageWidth,
  minImageWidth,
  match,
  history
}) => {
  const mainRef = useRef(null)

  // >> state
  const [ imageWidth, setImageWidth ] = useState(initialImageWidth)
  const [ { rows, columns }, setGridDimensions ] = useState({ rows: 0, columns: 0 })
  const [ selectedRanges, setSelectedRanges ] = useState(getSelectedRanges(data.frames))
  const [ selectionStartIndex, setSelectionStartIndex ] = useState(null)
  // << state

  // >> state derived variables
  const currentPage = parseInt(match.params.page) || 1
  const currentPageIndex = currentPage - 1
  const imagesPerPage = rows * columns
  const imageHeight = imageWidth / imageRatio
  const pageCount = Math.ceil(data.frames.length / imagesPerPage)
  // << state derived variables

  // >> helpers
  const recalcGrid = () => {
    const {
      offsetWidth: width,
      offsetHeight: height
    } = mainRef.current
    const newColumns = Math.floor(width / imageWidth)
    const newRows = Math.floor(height / (imageHeight + gridGap * 2))
    const newImagesPerPage = newColumns * newRows

    // don't update if the window is too small
    if (newImagesPerPage) {
      setGridDimensions({ rows: newRows, columns: newColumns })

      // if current page value from url is too big
      if (data.frames.length < newImagesPerPage * currentPage) {
        history.push(`/${Math.floor(data.frames.length / newImagesPerPage) + 1}`)
      }

      // recalc current page on resize
      if (imagesPerPage) { // (skip this step on mount)
        const firstImageIndex = imagesPerPage * currentPageIndex
        history.push(`/${Math.floor(firstImageIndex / newImagesPerPage) + 1}`)
      }
    }
  }

  const getImageClassName = (index) =>
    index === selectionStartIndex
      ? 'imageSelectionStart'
      : isIndexSelected(index, selectedRanges)
        ? 'imageSelected'
        : 'image'

  const getGridStyle = () => ({
    gridTemplateColumns: `repeat(
      ${columns},
      ${imageWidth}px
    )`,
    gridTemplateRows: `repeat(
      ${rows},
      ${imageHeight}px
    )`,
    gridGap
  })

  const getImageStyle = (index) => ({
    gridColumn: `${(index % columns) + 1} / span 1`,
    gridRow: `${Math.floor(index / columns) + 1} / span 1`
  })
  // << helpers

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

  const handleImgWidthChange = (e) => {
    setImageWidth(e.target.value)
    recalcGrid()
  }
  // << event handlers

  // >> effects
  useLayoutEffect(() => {
    window.addEventListener('resize', recalcGrid)
    return () => {
      window.removeEventListener('resize', recalcGrid)
    }
  })

  // inital grid calculation on <main>'s mount
  useLayoutEffect(recalcGrid, [ mainRef.current ])
  // << effects

  return (
    <div className='app'>
      <Header
        minImageWidth={minImageWidth}
        maxImageWidth={maxImageWidth}
        imageWidth={imageWidth}
        currentPage={currentPage}
        pageCount={pageCount}
        handleSelectAll={handleSelectAll}
        handleDeselectAll={handleDeselectAll}
        handleSaveClick={handleSaveClick}
        handleImgWidthChange={handleImgWidthChange}
      />
      <main
        className='main'
        ref={mainRef}
        style={getGridStyle()}
      >
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
              style={getImageStyle(imgIndex)}
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
  initialImageWidth: 300,
  maxImageWidth: 400,
  minImageWidth: 50,
  gridGap: 5,
  imageRatio: 300 / 168.75 // width / height
}

export default hot(App)

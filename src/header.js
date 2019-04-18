import React from 'react'
import { Link } from 'react-router-dom'
import './header.css'

const Header = ({
  minImageWidth,
  maxImageWidth,
  imageWidth,
  handleImgWidthChange,
  currentPage,
  pageCount,
  handleSelectAll,
  handleDeselectAll,
  handleSaveClick
}) => {
  const hasNextPage = currentPage < pageCount
  const hasPrevPage = currentPage > 1
  return (
    <header className='header'>
      <div className='imageWidth'>
        <input
          type='range'
          min={minImageWidth}
          max={maxImageWidth}
          step={1}
          onChange={handleImgWidthChange}
          value={imageWidth}
        />
        <label>
          {imageWidth}
        </label>
      </div>
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
  )
}

export default Header

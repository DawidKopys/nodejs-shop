const RANGE = 2;

const createPagesRange = (currentPage, totalPagesNumber) => {
  const pages = [];
  for (i = -RANGE; i <= RANGE; i++) {
    const pageNumber = currentPage + i;
    if (pageNumber < 1) {
      continue;
    }
    if (pageNumber > totalPagesNumber) {
      break;
    }
    pages.push(pageNumber);
  }
  return pages;
};

const buildPager = (currentPageNumber, totalPagesNumber) => {
  const pagesRange = createPagesRange(currentPageNumber, totalPagesNumber);

  const hasNextPage = pagesRange
    .indexOf(currentPageNumber) < pagesRange.length - 1;
  const hasPreviousPage = currentPageNumber !== 1;
  const isLastPageShown = pagesRange.includes(totalPagesNumber);
  const isSecondToLastPageShown = pagesRange.includes(totalPagesNumber - 1);
  const isFirstPageShown = pagesRange.includes(1);
  const isSecondToFirstPageShown = pagesRange.includes(2);
  
  const extendedPages = pagesRange.map((pageNumber) => {
    return {
      label: pageNumber,
      url: `?page=${pageNumber}`,
      isActive: pageNumber === currentPageNumber
    }
  })
  
  if (!isSecondToFirstPageShown) {
    extendedPages.unshift({
      label: '...',
      url: null,
      isActive: false
    })
  }
  
  if (!isFirstPageShown) {
    extendedPages.unshift({
      label: 1,
      url: `?page=1`,
      isActive: false
    })
  }
  
  if (hasPreviousPage) {
    extendedPages.unshift({
      label: '<',
      url: `?page=${currentPageNumber - 1}`,
      isActive: false
    })
  }
  
  if (!isSecondToLastPageShown) {
    extendedPages.push({
      label: '...',
      url: null,
      isActive: false
    })
  }
  
  if (!isLastPageShown) {
    extendedPages.push({
      label: totalPagesNumber,
      url: `?page=${totalPagesNumber}`,
      isActive: false
    })
  }
  
  if (hasNextPage) {
    extendedPages.push({
      label: '>',
      url: `?page=${currentPageNumber + 1}`,
      isActive: false
    })
  }
  
  return extendedPages;
}

module.exports.buildPager = buildPager;
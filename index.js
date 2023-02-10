// All movie API: https://webdev.alphacamp.io/api/movies
// detail movie API : https://webdev.alphacamp.io/api/movies/{id}
// Image for movie API (filename from movie API ): https://webdev.alphacamp.io/posters/{filename}

// default
const currentPage = document.querySelector("#current-page").dataset.page
const moviePerPage = 20
let currentMode = "card"
let currentPageNumber = 1

// API
const movieDataApi = "https://webdev.alphacamp.io/api/movies"
const movieDetailApi = "https://webdev.alphacamp.io/api/movies/"
const movieImageApi = "https://webdev.alphacamp.io/posters/"

// elements
const searchBtn = document.querySelector("#search-btn")
const searchInput = document.querySelector("#search-input")
const moviePanel = document.querySelector("#movie-panel")
const modalTitle = document.querySelector("#modal-title")
const modalImage = document.querySelector("#modalImage")
const modalDate = document.querySelector("#modal-date")
const modalDes = document.querySelector("#modal-des")
const modalDirector = document.querySelector("#modal-director")
const modalStars = document.querySelector("#modal-stars")
const favoriteLink = document.querySelector("#fav-link")
const pagination = document.querySelector("#pagination-ul")
const modeToggle = document.querySelector("#mode-toggle")

// Enable tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

// Model
const model = {
  allMovies: [],

  favoriteMovies: [],

  getMovieDataWithId(movieId, movieData) {
    const id = Number(movieId)
    return this.allMovies.find(movie => movie.id === id)
  },

  filterMovieDataByTitle(title, movieData) {
    // if no input, return normal data
    if (title.length === 0 || title === null) {
      return movieData
    } else {
      // with input, return filtered data
      const titleLower = title.toLowerCase().trim()
      const filteredData = movieData.filter(movie => {
        const movieTitle = movie.title.toLowerCase()
        return movieTitle.includes(titleLower)
      })
      return filteredData
    }
  },
  toggleToLocalStorage(id) {
    // check if already saved
    const index = this.favoriteMovies.findIndex(favMovie => favMovie.id === Number(id))

    if (index === -1) {
      console.log("save movie")
      // get movie from data
      const movie = this.getMovieDataWithId(id, this.allMovies)
      // add movie to favorite list
      this.favoriteMovies.push(movie)
      // override favorite list in local storage
      localStorage.setItem("favoriteMovies", JSON.stringify(this.favoriteMovies))

    } else {
      console.log("remove movie")
      // remove from list
      this.favoriteMovies.splice(index, 1)
      // override favorite list in local storage
      localStorage.setItem("favoriteMovies", JSON.stringify(this.favoriteMovies))
    }
  },

  loadDataFromLocalStorage() {
    // get data from local storage
    const data = JSON.parse(localStorage.getItem("favoriteMovies"))
    if (!data || data.length === 0) return

    this.favoriteMovies = data
  },
  getFavoriteMovieLength() {
    return this.favoriteMovies.length
  },
  paginateMovieData(page, movieData) {
    const startIndex = moviePerPage * (page - 1)
    const endIndex = moviePerPage * page // not inclusive
    const sliceData = movieData.slice(startIndex, endIndex)
    return sliceData
  },
  saveCurrentMode(){
    localStorage.setItem("mode", currentMode)
  },
  loadCurrentMode(){
   const mode = localStorage.getItem("mode")
   if (mode){
    currentMode = mode
   }
  }
}

// View
const view = {
  renderMoviePanel(movieData) {
    //render movie panel using model.movieData
    moviePanel.innerHTML = ""
    movieData.forEach(movie => {
      const imageSrc = movieImageApi + movie.image
      const raw = `
      <div class="card m-3" style="width: 16rem;">
        <img src="${imageSrc}" class="card-img-top"
          alt="movie poster">
        <div class="card-body">
          <h5 class="card-title m-0">${movie.title}</h5>
        </div>
        <div class="card-footer">
          <a href="#" class="more-btn btn btn-primary" data-bs-toggle="modal" data-bs-target="#movieModal" data-id="${movie.id}">More</a>
          <a href="#" class="fav-btn btn btn-info" data-id="${movie.id}">+</a>
        </div>
      </div>
      `
      moviePanel.innerHTML += raw
    })
  },
  renderMoviePanelAsList(movieData) {
    //render movie panel using model.movieData
    moviePanel.innerHTML = ""
    movieData.forEach(movie => {
      const imageSrc = movieImageApi + movie.image
      const raw = `
      <div style="width:100%;" class="d-flex justify-content-start align-items-center border-top ms-4">
        <div style="width:70%;" class="m-2 fw-bold">
        ${movie.title}
        </div>
        <div class="my-2">
          <a href="#" class="more-btn btn btn-primary" data-bs-toggle="modal" data-bs-target="#movieModal" data-id="${movie.id}">More</a>
          <a href="#" class="fav-btn btn btn-info" data-id="${movie.id}">+</a>
        </div>
      </div>
      `
      moviePanel.innerHTML += raw
    })
  },
  renderModalInfo(movie) {
    modalTitle.textContent = movie.title
    modalImage.src = movieImageApi + movie.image
    modalDate.textContent = movie.release_date
    modalDes.textContent = movie.description
    modalDirector.innerHTML = `
      <a href="https://en.wikipedia.org/wiki/${movie.director}" target="_blank" class="me-1">${movie.director}</span><br>
    `
    // stars
    modalStars.innerHTML = ""
    const castLength = movie.cast.length - 1
    movie.cast.forEach(cast => {
      const raw = `
      <a href="https://en.wikipedia.org/wiki/${cast.name}" target="_blank" class="me-1">${cast.name}</span><br>
      `
      modalStars.innerHTML += raw
    })
  },
  renderFavButton(favoriteMovie) {
    const favButtons = document.querySelectorAll(".fav-btn")
    favButtons.forEach(button => {
      const id = button.dataset.id
      if (favoriteMovie.some(movie => movie.id === Number(id))) {
        button.classList.remove("btn-info")
        button.classList.add("btn-danger")
        button.textContent = "-"
      } else {
        button.classList.remove("btn-danger")
        button.classList.add("btn-info")
        button.textContent = "+"
      }
    })
  },
  renderFavoriteLinkNumber(length) {
    if (length > 0) {
      favoriteLink.textContent = `Favorites (${length})`
    } else {
      favoriteLink.textContent = "Favorites"
    }
  },
  renderPaginationLinks(movieData) {
    pagination.innerHTML = ""
    let totalPage = Math.ceil(movieData.length / moviePerPage)
    console.log(`movie data length : ${movieData.length}`)
    console.log(`totalPage : ${totalPage}`)
    if (totalPage <= 1) return // 1 more less page don't render
    for (let i = 1; i <= totalPage; i++) {
      const raw = `
      <li id="page-${i}" class="page-item"><a class="page-link page-current" href="#" data-page="${i}">${i}</a></li>
      `
      pagination.innerHTML += raw
    }
  },
  currentPageHighlight(page) {
    // remove all
    const all = document.querySelectorAll(".page-item")
    all.forEach(item => item.classList.remove("active"))
    // add current page
    const link = document.querySelector(`#page-${page}`)
    if (link){ 
      link.classList.add("active")
    }
  },

}

// Control
const control = {
  // 開始時取得資料＋顯示畫面
  getDataAndRenderPage() {
    axios.get(movieDataApi)
      .then(response => {
        model.allMovies = response.data.results
        model.loadDataFromLocalStorage()
        model.loadCurrentMode()
        view.renderFavoriteLinkNumber(model.favoriteMovies.length)
        if (currentPage === "index") {
          const sliceData = model.paginateMovieData(1, model.allMovies)
          this.renderMoviePanelByMode(1, sliceData)
          view.renderPaginationLinks(model.allMovies)
          view.currentPageHighlight(1)
        }
        if (currentPage === "favorite") {
          const sliceData = model.paginateMovieData(1, model.favoriteMovies)
          this.renderMoviePanelByMode(1, sliceData)
          view.renderPaginationLinks(model.favoriteMovies)
          view.currentPageHighlight(1)
        }
        // after the panel is render
        view.renderFavButton(model.favoriteMovies)
      })
      .catch(error => {
        console.log(error)
      })
  },
  // 依照顯示模式，當前頁數顯示頁面 
  renderMoviePanelByMode(page, movieData) {
    const sliceData = model.paginateMovieData(page, movieData)
    view.currentPageHighlight(page)

    if (currentMode === "card") {
      view.renderMoviePanel(sliceData)
    }
    if (currentMode === "list") {
      view.renderMoviePanelAsList(sliceData)
    }
    view.renderFavButton(model.favoriteMovies)
    this.goToTop()
  },
  renderModal(id) {
    //get detail movie data
    axios.get(movieDetailApi + id)
      .then(response => {
        const movie = response.data.results
        view.renderModalInfo(movie)
      })
      .catch(error => {
        console.log(error)
      })
  },
  renderSearchedMoviePanel(searchInput) {
    // Index Page
    if (currentPage === "index") {
      // search results
      const filteredData = model.filterMovieDataByTitle(searchInput, model.allMovies)
      // first page movies
      const sliceData = model.paginateMovieData(1, filteredData)
      this.renderMoviePanelByMode(1, sliceData)
      view.renderPaginationLinks(filteredData)
      view.currentPageHighlight(currentPageNumber)
      view.renderFavButton(model.favoriteMovies)
    } else if (currentPage === "favorite") {
      // Favorite Page
      // search result
      const filteredData = model.filterMovieDataByTitle(searchInput, model.favoriteMovies)
      // first page result
      const sliceData = model.paginateMovieData(1, filteredData)
      this.renderMoviePanelByMode(1, sliceData)
      view.renderPaginationLinks(filteredData)
      view.currentPageHighlight(currentPageNumber)
      view.renderFavButton(model.favoriteMovies)
    }
  },
  toggleFavorite(id) {
    model.toggleToLocalStorage(id)
    view.renderFavButton(model.favoriteMovies)
    view.renderFavoriteLinkNumber(model.getFavoriteMovieLength())
    // favorite page : remove card
    if (currentPage === "favorite") {
      this.renderMoviePanelByMode(currentPageNumber, model.favoriteMovies)
      view.renderFavButton(model.favoriteMovies)
      view.renderPaginationLinks(model.favoriteMovies)
    }
  },
  changePage(page, movieData){
    this.renderMoviePanelByMode(page, movieData)
    currentPageNumber === page
  },
  goToTop() {
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0;
  },
  changeMode(mode){
    currentMode = mode
    model.saveCurrentMode(currentMode)
  },

}

// Start
control.getDataAndRenderPage()

// Search Button
searchBtn.addEventListener("click", function onSearchBtnClicked(event) {
  event.preventDefault()
  control.renderSearchedMoviePanel(searchInput.value)
  searchInput.value = ""
})

// Movie panel buttons
moviePanel.addEventListener("click", event => {
  event.preventDefault()
  const target = event.target
  // card More buttons
  if (target.matches(".more-btn")) {
    control.renderModal(target.dataset.id)
  }
  // card Favorite button
  if (target.matches(".fav-btn")) {
    control.toggleFavorite(target.dataset.id)
  }
})

// Pagination
pagination.addEventListener("click", event => {
  event.preventDefault()
  const target = event.target
  if (target.matches(".page-link")) {
    const pageNumber = target.dataset.page
    // change page
    if (currentPage === "index") {
      control.changePage(pageNumber, model.allMovies)
    } else if (currentPage === "favorite") {
      control.changePage(pageNumber, model.favoriteMovies)
    }
  }
})

// Mode toggle
modeToggle.addEventListener("click", function onModeToggle(event){
  const target = event.target
  if (target.matches(".mode-btn")){
    control.changeMode(target.dataset.mode)
    if (currentPage === "index") {
      control.changePage(currentPageNumber, model.allMovies)
    } else if (currentPage === "favorite") {
      control.changePage(currentPageNumber, model.favoriteMovies)
    }
  }
})
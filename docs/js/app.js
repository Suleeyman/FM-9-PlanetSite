'use strict'

const root = document.querySelector(':root')
const body = document.querySelector('body')
const overlay = document.querySelector('#overlay')
const nav = document.querySelector('nav')
const toggle = document.querySelector('.toggle')
const main = document.querySelector('main')
let navDetail = main.querySelector('.nav-detail')

class App {

    constructor() {
        /* PRIVATE VARIABLES */
        this._html = ''; // String to be inserted in the dom (about a planet)
        this._html2 = ''; // "" (about the description of a planet)
        this._indexOfLi = 0; // Index of the active description
        this._description = ''; // The actual descrition of the planet
        this._colorTheme = { // Change the secondary color according to the planet
            Mercury: "#419EBB",
            Venus: "#eda249",
            Earth: "#6d2ed5",
            Mars: "#d14c32",
            Jupiter: "#d83a34",
            Saturn: "#cd5120",
            Uranus: "#1ec142",
            Neptune: "#2d68f0",
        }
        this._data = {}; // The json file's data
        this._getJsonData()
            .then(data => {
                this._data = data;
                this._objectOfThePlanet = this._data[2]
                this._getLocalStorage()
        })

        /* INITIALIZER */
        navDetail.children[0].classList.add('bg-lg-li')
        root.style.setProperty('--secondary-color', `${this._colorTheme['Earth']}`)

        /* EVENT LISTENER */
        toggle.addEventListener('click', this._mobileToggle)
        nav.addEventListener('click', this._chosePlanet.bind(this))
        nav.addEventListener('keypress', this._chosePlanet.bind(this))
        navDetail.addEventListener('click', this._choseDetail.bind(this))
        navDetail.addEventListener('keypress', this._choseDetail.bind(this))
    }

    _mobileToggle() {
        nav.classList.toggle('is-open')

        /*  Update the tabindex of nav's element according if is active or not*/
        Array.from(nav.children[0].children).forEach(li =>  {
            li.children[0].tabIndex = li.children[0].tabIndex === -1 ? 0 : -1
        })
        toggle.classList.toggle('opacity')
        overlay.classList.toggle('fixed')
        body.classList.toggle('overflowY-hidden')
    }

    _chosePlanet(e) {
        const liPicked = e.target.closest('li')
        if(!liPicked) {
            return;
        }
        const planet = liPicked.children[0].textContent.toLowerCase()
        this._objectOfThePlanet = this._data.find(el => {
            return el.name.toLowerCase() === planet
        })
        // console.log(this._objectOfThePlanet);
        this._insertInTheDom(this._objectOfThePlanet)
        // this._mobileToggle()
        overlay.classList.remove('fixed')
        body.classList.remove('overflowY-hidden')
        nav.classList.remove('is-open')
        toggle.classList.remove('opacity')
    }

    _insertInTheDom(data) {
        this._html = `
            <div class="img-block">
                <img id="planet" src="${this._description === "structure" ? `${data.images["internal"]}` : `${data.images["planet"]}`}" alt="Planet ${data.name}">
                ${this._description === "geology" ? `<img id="geology" src="${this._objectOfThePlanet.images["geology"]}" alt="Geology of the ${this._objectOfThePlanet.name}">` : ''}
            </div>
            <div class="main-content">
              <h1>${data.name}</h1>
              <p class="content">${data[this._description].content}</p>
              <div>
                Source :
                <a id="wiki-link" href="${data[this._description].source}" target="_blank" tabindex="0">
                  Wikipedia
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><path fill="var(--secondary-color)" d="M11.34.66C10.9.22 10.37 0 9.75 0h-7.5C1.63 0 1.1.22.66.66.22 1.1 0 1.63 0 2.25v7.5c0 .62.22 1.15.66 1.59.44.44.97.66 1.59.66h7.5c.62 0 1.15-.22 1.59-.66.44-.44.66-.97.66-1.59v-7.5c0-.62-.22-1.15-.66-1.59zM10 6.25a.467.467 0 01-.305.46.544.544 0 01-.195.04.465.465 0 01-.352-.149L8.023 5.476 3.852 9.648a.481.481 0 01-.352.149.48.48 0 01-.352-.149l-.796-.797a.48.48 0 01-.149-.351.48.48 0 01.149-.352l4.172-4.172-1.125-1.125c-.162-.15-.198-.333-.11-.546A.467.467 0 015.75 2H9.5c.135 0 .253.05.352.148A.48.48 0 0110 2.5v3.75z" opacity=".75"/></svg>
                </a>
              </div>
            </div>
            <ul class="nav-detail">
              <li>
                <a role="button" tabindex="0" data-description="overview">Overview</a>
              </li>
              <li>
                <a role="button" tabindex="0" data-description="structure">Structure</a>
              </li>
              <li>
                <a role="button" tabindex="0" data-description="geology">Surface</a>
              </li>
            </ul>
            <aside>
              <ul>
                <li class="detail-li">
                    rotation time
                    <strong>
                      ${data.rotation}
                    </strong>
                  </li>
                <li class="detail-li">
                    revolution time
                    <strong>
                        ${data.revolution}
                    </strong>
                </li>
                <li class="detail-li">
                    radius
                    <strong>
                        ${data.radius}
                    </strong>
                </li>
                <li class="detail-li">
                    average temp.
                    <strong>
                        ${data.temperature}
                    </strong>
                </li>
              </ul>
            </aside>
        `

        let mainArr = Array.from(main.children)

        for(let i = 0, n = mainArr.length; i < n; i++) {
            mainArr[i].remove()
        }

        this._changeTheSecondaryColor(data)
        main.insertAdjacentHTML('afterbegin', this._html)
        navDetail = main.querySelector('.nav-detail')
        navDetail.addEventListener('click', this._choseDetail.bind(this))
        navDetail.addEventListener('keypress', this._choseDetail.bind(this))
        this._activeTheExactLi(navDetail.children[+localStorage.getItem('indexOfLi')])
    }

    /*
    This function update the content (description, image,...)
    according to the picked description
    */
    _choseDetail(e) {
        const liPicked = e.target.closest('li')
        if(!liPicked) {
            return;
        }

        this._activeTheExactLi(liPicked)

        /* Take the description from de li's child's data */
        this._description = liPicked.children[0].dataset.description
        this._changeTheDescription()
        
        this._setLocalStorage(this._description)
    }

    _activeTheExactLi(el) {
        let navArr = Array.from(navDetail.children)
        navArr.forEach(li => {
            li.classList.remove('bg-lg-li')
        })
        el.classList.add('bg-lg-li')
        localStorage.setItem('indexOfLi', navArr.indexOf(el))
    }

    _changeTheDescription() {
        this._html2 = `
            <div class="img-block">
                <img id="planet" src="${this._description === "structure" ? `${this._objectOfThePlanet.images["internal"]}` : `${this._objectOfThePlanet.images["planet"]}`}" alt="Planet Earth">
                ${this._description === "geology" ? `<img id="geology" src="${this._objectOfThePlanet.images["geology"]}" alt="Geology of the ${this._objectOfThePlanet.name}">` : ''}
            </div>
            <div class="main-content">
                <h1>${this._objectOfThePlanet.name}</h1>
                <p class="content">${this._objectOfThePlanet[this._description].content}</p>
                <div>
                  Source :
                  <a id="wiki-link" href="${this._objectOfThePlanet[this._description].source}" target="_blank" tabindex="0">
                    Wikipedia
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><path fill="var(--secondary-color)" d="M11.34.66C10.9.22 10.37 0 9.75 0h-7.5C1.63 0 1.1.22.66.66.22 1.1 0 1.63 0 2.25v7.5c0 .62.22 1.15.66 1.59.44.44.97.66 1.59.66h7.5c.62 0 1.15-.22 1.59-.66.44-.44.66-.97.66-1.59v-7.5c0-.62-.22-1.15-.66-1.59zM10 6.25a.467.467 0 01-.305.46.544.544 0 01-.195.04.465.465 0 01-.352-.149L8.023 5.476 3.852 9.648a.481.481 0 01-.352.149.48.48 0 01-.352-.149l-.796-.797a.48.48 0 01-.149-.351.48.48 0 01.149-.352l4.172-4.172-1.125-1.125c-.162-.15-.198-.333-.11-.546A.467.467 0 015.75 2H9.5c.135 0 .253.05.352.148A.48.48 0 0110 2.5v3.75z" opacity=".75"/></svg>
                  </a>
                </div>
            </div>
        `
        let mainArr = Array.from(main.children)
        for (let i = 0; i < 2; i++) {
            mainArr[i].remove()
        }

        main.insertAdjacentHTML('afterbegin', this._html2)
       
    }

    async _getJsonData() {
        const resp = await fetch('./js/data.json')
        const data = await resp.json()
        return data;
    }

    _changeTheSecondaryColor(data) {
        root.style.setProperty('--secondary-color', `${this._colorTheme[data.name]}`)
    }

    _setLocalStorage(element) {
        localStorage.setItem('description', element)
    }

    _getLocalStorage() {
        this._description = localStorage.getItem('description')
        this._indexOfLi = +localStorage.getItem('indexOfLi')
        if(!this._description) return;
        this._changeTheDescription()
        this._activeTheExactLi(navDetail.children[this._indexOfLi])
    }
}

const app = new App()
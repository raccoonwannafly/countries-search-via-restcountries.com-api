"use strict";



function filterCountry(category, value) {
    if(category === "name") {
        return countriesObj.countries.filter(country => country.name.official.toLowerCase().includes(value));
    }
    if(category === "region") {
        return fetchResult.filter(country => country.region === value)
    }
    if(category === 'cca3') {
        return countriesObj.countries.find(country => country.cca3 === value);
    }
}

function updateSpec(country) {
    document.querySelectorAll('[data-country-spec]').forEach(spec => {
        const specCategory = spec.getAttribute('data-country-spec');
        if (specCategory === 'nativeName') {
            let nativeNames = '';
            for(const name in country.name.nativeName) {
                nativeNames += ' ' + country.name.nativeName[name].official + '.';
                // console.log("native: ", name.official);
            }
            spec.innerText = nativeNames;
        } else if (specCategory === 'name') {
            spec.innerText = country.name.official;
        } else if (specCategory === 'capital') {
            let capital = '';
            if(typeof country.capital == "object") {
                capital = country.capital[0];
                
            } else { capital = country.capital }
            spec.innerText = capital;
        } else if(specCategory === 'currencies') {
            let currencies = '';
            for(const currency in country.currencies) {
                currencies += country.currencies[currency].name + ' (' + country.currencies[currency].symbol + ') ';
            }
            spec.innerText = currencies;
        } else if (specCategory === 'languages') {
            let speaks = '';
            for(const language in country.languages) {
                speaks += country.languages[language] + ' ';
            }
            spec.innerText = speaks;
        } else if (specCategory === 'tld') {
            spec.innerText = country.tld.join(' ');
        } else if(specCategory === 'borders') {
            spec.innerHTML = '';
            if(country.borders) {
                // <h3 class="h3 me-3 d-inline">Border countries:</h3>
                const borderTitle = document.createElement('h3');
                borderTitle.classList.add('h3', 'me-3', 'd-inline');
                borderTitle.innerText = 'Border countries:'
                spec.append(borderTitle);
                for(const border of country.borders) {
                    const filteredCountry = filterCountry('cca3', border);
                    console.log(filteredCountry.name.common);
                    const button = document.createElement('input');
                    button.type = 'button';
                    button.classList.add('btn', 'btn-secondary', 'border-country', 'me-2');
                    button.value = filteredCountry.name.common;

                    button.addEventListener('click', () => {
                        updateSpec(filteredCountry);
                    })
                    spec.append(button);
                    // <input type="button" class="btn btn-secondary border-country" value="" data-country-spec="border"></input>
                }
            }
        } else if (specCategory === 'flags') {
            spec.src = country.flags.png;
        } else if (specCategory === 'population'){
            spec.innerHTML = country.population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
            spec.innerHTML = country[specCategory];
        }
    })
}

function createCountryCard (country) {
    const divCol = document.createElement("div");
    divCol.classList.add("col-auto", "col-md-4", "col-lg-3", "col-xxl-2", "m-5", "country-card");

    const card = document.createElement("div");
    card.classList.add("card", "shadow-sm");
    card.style = "max-width: 18rem; min-width: 15rem; min-height: 27rem";

    const img = document.createElement("img");
    img.src = country.flags.png;
    img.classList.add("card-img-top");

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title", "mb-2");
    cardTitle.innerText = country.name.official;

    const cardPop = document.createElement("p");
    cardPop.classList.add("card-text");
    cardPop.innerText = `Population: ${country.population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

    const cardReg = document.createElement("p");
    cardReg.classList.add("card-text");
    cardReg.innerText = `Region: ${country.region}`;

    const cardCap = document.createElement("p");
    cardCap.classList.add("card-text");

    // console.log(typeof country.capital);
    if(typeof country.capital == "object") {
        cardCap.innerText = 'Capital: ' + country.capital[0];
    } else { cardCap.innerText = 'Capital: ' + country.capital }

    cardBody.append(cardTitle, cardPop, cardReg, cardCap);
    card.append(img, cardBody);
    divCol.append(card);

    divCol.addEventListener("click", () => {
        countryCards.classList.remove("opened");
        document.querySelectorAll('.country-card').forEach(element => element.style.display = "none");
        countrySpec.classList.add("opened");
        updateSpec(country);
    })

    return divCol;
}

const countriesApi = "https://restcountries.com/v3.1/all";
const fetchResult = [];

fetch(countriesApi).then(response => { return response.json() }).then(data => {fetchResult.push(...data)});

const countriesObj = {
    countries: fetchResult,
    // get europe() {
    //     return fetchResult.filter(country => country.region === "Europe")
    // },
    // get africa() {
    //     return fetchResult.filter(country => country.region === "Africa")
    // },
    // get asia() {
    //     return fetchResult.filter(country => country.region === "Asia")
    // },
    // get oceania() {
    //     return fetchResult.filter(country => country.region === "Oceania")
    // },
    // get americas() {
    //     return fetchResult.filter(country => country.region === "Americas")
    // }
}

const countryCards = document.getElementById('country-cards');
const searchBar = document.getElementById('search-bar');
const searchBarBtn = document.getElementById('search-bar-btn');

searchBar.addEventListener('keyup', () => {
    if(searchBar.value) {
        countryCards.innerHTML = '';
        filterCountry("name", searchBar.value).forEach(country => {
            countryCards.append(createCountryCard(country));
        })
    } else {
        countryCards.innerHTML = '';
    }
    if(!countryCards.classList.contains('opened')) {
        countryCards.classList.add("opened");
        countrySpec.classList.remove("opened");
        document.querySelectorAll('.country-card').forEach(element => element.style.display = "unset");
    }
})


const regionFilter = document.getElementById("filter-by-region");

regionFilter.addEventListener('change', () => {
    countryCards.innerHTML = '';
    const index = regionFilter.selectedIndex;
    const region = regionFilter[index].value;
    filterCountry("region", region).forEach(country => {
        countryCards.append(createCountryCard(country));
    });
    if(!countryCards.classList.contains("opened")) {
        document.querySelectorAll('.country-card').forEach(element => element.style.display = "unset");
        countryCards.classList.add("opened");
        countrySpec.classList.remove("opened");
    }
})

const backBtn = document.getElementById('back-btn');
const countrySpec = document.getElementById("country-specific-info");

backBtn.addEventListener('click', () => {
    countryCards.classList.add("opened");
    countrySpec.classList.remove("opened");
    document.querySelectorAll('.country-card').forEach(element => element.style.display = "unset");
})

const darkModeBtn = document.querySelector('.dark-mode-btn')

darkModeBtn.addEventListener('click', () => {
    document.documentElement.dataset.bsTheme = ( document.documentElement.dataset.bsTheme === 'dark' ) ? 'light' : 'dark'
    document.querySelector('.navbar').classList.remove
})




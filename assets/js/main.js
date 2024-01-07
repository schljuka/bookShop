

const URL = `https://my-json-server.typicode.com/schljuka/bookJson/`;


document.querySelector(`#pretraga`).addEventListener("keyup", filterChange);
document.querySelector(`#rang`).addEventListener("change", filterChange);
document.querySelector(`#sort`).addEventListener("change", filterChange);
document.querySelector(`#reset`).addEventListener("click", reset);

let states = document.querySelectorAll(`.stanje`);

states.forEach(elem => {
    elem.addEventListener("change", filterChange);
})

async function filterChange() {

    const checkedWriters = getCheckedCheckboxes(".pisac"); //-----------------------
    const checkedGenres = getCheckedCheckboxes(".zanr"); //-----------------------


    await getData("knjige", renderBooks);
    await getData("pisci", renderWriter);
    await getData("zanrovi", renderGenres);




    setCheckedCheckboxes(".pisac", checkedWriters); //-----------------------
    setCheckedCheckboxes(".zanr", checkedGenres); //-----------------------
}



// ----------------------------
function getCheckedCheckboxes(selector) {
    const checkboxes = document.querySelectorAll(selector);
    return Array.from(checkboxes).filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
}

// ---------------------
function setCheckedCheckboxes(selector, values) {
    console.log(selector, values);
    const checkboxes = document.querySelectorAll(selector);
    checkboxes.forEach(checkbox => {
        checkbox.checked = values.includes(checkbox.value);
    });
}



async function getData(endpoint, callback) {

    try {
        const res = await fetch(URL + endpoint);
        const data = await res.json();
        callback(data);
    } catch (e) {
        console.log(e);
    }
}


function init() {
    getData("pisci", renderWriter);
    getData("zanrovi", renderGenres);
    getData("knjige", renderBooks);
}





function renderBooks(data) {

    data = filterWriter(data);
    data = filterGenre(data);
    data = filterPrice(data);
    data = filterState(data);
    data = filterSearch(data);
    data = sortPrice(data);



    let html = ``;

    if (data.length == 0) {

        html = `<p class="text-danger">Nema rezultata pretrage! <p>`;
    } else {
        for (let i = 0; i < data.length; i++) {
            html += `
        <div class="col-lg-4 col-md-6 mb-4">
        
        <div class="card h-100">
        <img src='./assets/img/${data[i].slika.src}' alt='./assets/img/${data[i].slika.alt}' class="card-img-top">
        <div class="card-body">

        <h3 class="card-title">${data[i].naslov}</h3>
        <p class="card-text">${getWriter(data[i].pisacID)}</p>
        <p class="card-text">${getGenres(data[i].zanrovi)}</p>
        <p class="card-text ${data[i].naStanju ? 'text-success' : 'text-danger'}">
        ${data[i].naStanju ? "In stock" : "Out of stock"}</p>
        <p class="card-text text-decoration-line-through text-secondary"><s>Old price: ${data[i].price.staraCena} €</s></p>
        <p class="card-text text-primary">New price: ${data[i].price.novaCena} €</p>
        <div class="text-center">
        <button class="btn btn-primary">Add to cart</button>
        </div>
        </div>
        </div>
        </div>`;
        }
    }
    document.querySelector(`#knjige`).innerHTML = html;

    sessionStorage.setItem("knjigeZanrovi", JSON.stringify(data));


}


function renderWriter(data) {

    sessionStorage.setItem("pisci", JSON.stringify(data));

    const writer = document.querySelector(`#pisci`);

    let html = ``;

    data.forEach(element => {

        html += `
            <li class="list-group-item">
                   <input type="checkbox" value="${element.id}" class="pisac" name="pisci"/> <span> ${element.ime} ${element.prezime} (${getCountBooks(element.id)})</span>
                </li>`

    });

    writer.innerHTML = html;

    let writers = document.querySelectorAll(`.pisac`);

    writers.forEach(elem => {

        elem.addEventListener("change", filterChange);
    })

}


function getWriter(id) {

    let writers = JSON.parse(sessionStorage.getItem("pisci"));

    let obj = writers.filter(elem => elem.id == id)[0];

    return obj.ime + " " + obj.prezime;

}


function getCountBooks(id) {
    let books = JSON.parse(sessionStorage.getItem("knjigeZanrovi"));
    let writerBooks = books.filter(elem => elem.pisacID == id);
    return writerBooks.length;
}



function renderGenres(data) {

    sessionStorage.setItem("zanrovi", JSON.stringify(data));

    const genre = document.querySelector(`#zanrovi`);

    let html = ``;

    data.forEach(element => {

        html += `
        <li class="list-group-item">
                   <input type="checkbox" value="${element.id}" class="zanr" name="zanrovi"/><span> ${element.naziv} (${getCountGenres(element.id)})</span>
                </li>`
    });

    genre.innerHTML = html;

    let genres = document.querySelectorAll(`.zanr`);

    genres.forEach(elem => {

        elem.addEventListener("change", filterChange);
    })

}


function getCountGenres(id) {
    let genre = JSON.parse(sessionStorage.getItem("knjigeZanrovi"));
    let genreBooks = genre.filter(elem => elem.zanrovi.includes(id));
    return genreBooks.length;

}


function getGenres(array) {

    let genres = JSON.parse(sessionStorage.getItem("zanrovi"));

    let html = ``;

    let newGenre = genres.filter(elem => array.includes(elem.id));

    newGenre.forEach((elem, i) => {
        html += elem.naziv;
        if (newGenre.length - 1 != i) {
            html += ', ';
        }
    });
    return html;

}






init();



// filteri

function filterSearch(data) {


    let word = document.querySelector(`#pretraga`).value;

    if (word) {

        return data.filter(elem => elem.naslov.toLowerCase().indexOf(word.trim().toLowerCase()) > -1)
    }
    return data;
}


function filterPrice(data) {

    let price = document.querySelector(`#rang`).value;

    document.querySelector(`#rez`).textContent = price + "€";

    return data.filter(elem => parseInt(elem.price.novaCena) <= parseInt(price));
}


function filterState(data) {

    let radio = document.querySelector(`.stanje:checked`);

    if (radio == "dostupno") {
        return data.filter(elem => elem.naStanju)
    } else if (radio.value == "nedostupno") {
        return data.filter(elem => !elem.naStanju)
    } else {
        return data;
    }


}



function filterGenre(data) {

    let checks = document.querySelectorAll(`.zanr`);

    let array = [];

    checks.forEach(elem => {
        if (elem.checked) {
            array.push(parseInt(elem.value));
        }
    })

    if (array.length > 0) {
        return data.filter(elem => elem.zanrovi.some(el => array.includes(el)));
    } else {
        return data;
    }
}


function filterWriter(data) {

    let checks = document.querySelectorAll(`.pisac`);

    let array = [];

    checks.forEach(elem => {
        if (elem.checked) {
            array.push(parseInt(elem.value));
        }
    })

    if (array.length > 0) {
        return data.filter(elem => array.includes(parseInt(elem.pisacID)));
    } else {
        return data;
    }

}



function sortPrice(data) {

    let method = document.querySelector(`#sort`).value;

    if (method == "asc") {
        return data.sort((a, b) => {
            if (parseInt(a.price.novaCena) > parseInt(b.price.novaCena)) {
                return 1;
            }
            if (parseInt(a.price.novaCena) < parseInt(b.price.novaCena)) {
                return -1;
            }
            if (parseInt(a.price.novaCena) == parseInt(b.price.novaCena)) {
                return 0;
            }
        });

    } else if (method == "desc") {
        return data.sort((a, b) => {
            if (parseInt(a.price.novaCena) < parseInt(b.price.novaCena)) {
                return 1;
            }
            if (parseInt(a.price.novaCena) > parseInt(b.price.novaCena)) {
                return -1;
            }
            if (parseInt(a.price.novaCena) == parseInt(b.price.novaCena)) {
                return 0;
            }
        });

    } else {
        return data;
    }

}


function reset() {

    let checksZ = document.querySelectorAll(`.zanr`);

    checksZ.forEach(elem => {
        elem.checked = false;
    })

    let checksP = document.querySelectorAll(`.pisac`);

    checksP.forEach(elem => {
        elem.checked = false;
    })

    document.querySelector(`#pretraga`).value = ``;
    document.querySelector(`#sort`).selectedIndex = 0;
    let states = document.querySelectorAll(`.stanje`);
    states.forEach(elem => {
        if (elem.value == "sve") {
            elem.checked = true;
        }
    });
    document.querySelector(`#rang`).value = 1000;
    document.querySelector(`#rez`).textContent = ``;

    filterChange();
}
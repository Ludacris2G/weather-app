const weatherApiKey = 'f47757ae44efb23112754f5207b23479';
const displayTemp = document.querySelector('.temperature');
const displayDescription = document.querySelector('.description'); 
const displayWind = document.querySelector('.wind');
const displayHumidity = document.querySelector('.humidity');
const displayTime = document.querySelector('.time');
const displayLoading = document.querySelector('.loading');
const displayLocation = document.querySelector('.location');
const input = document.querySelector('.input-bar');
const searchBtn = document.querySelector('.search-btn');
const displayIcon = document.querySelector('.icon');
const htmlIcon = document.querySelector('.html-icon');
const feelsLike = document.querySelector('.feels-like');

const weather = {
    fetchLocation: function(cityName) {
        fetch(
            `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${weatherApiKey}`
        )
        .then((response) => response.json())
        .then((data) => this.fetchWeather(data[0]))

        displayLocation.textContent = cityName;
    },
    fetchWeather: function(data) {
        let lat, lon;
        try {
            lat = data.lat;
            lon = data.lon;
            this.fetchTime(parseInt(lon), parseInt(lat));
            weather.fetchImage(input.value);
        } catch (error) {
            displayLoading.classList.add('not-found');
            input.value = '';
        }

        fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`
            )
            .then((response) => response.json())
            .then((data) => this.displayWeatherStats(data));
    },
    displayWeatherStats: function(data) {
        // data values
        console.log(data);
        const { description, icon } = data.weather[0];
        const { speed } = data.wind;
        const { humidity, temp, feels_like } = data.main;
        const { country } = data.sys;

        displayTemp.textContent = Math.trunc(temp) + '°C';
        displayDescription.textContent = description;
        displayWind.textContent = 'Wind Speed: ' + Math.trunc(speed) + 'km/h';
        displayLocation.textContent += ', ' + country;
        input.value = '';
        displayHumidity.textContent = 'Humidity: ' + humidity + '%';
        displayIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
        console.log(feels_like);
        if (Math.floor(Math.abs(feels_like - temp)) > 1) {
            feelsLike.style.display = 'block';
            feelsLike.textContent = 'Feels like: ' + Math.trunc(feels_like);
        } 
        else {
            feelsLike.style.display = 'none';
        }
    },
    fetchTime: function(lon, lat) {
        fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=4382121a5cff49aeaf5f3b9642ed2857`)
        .then(resp => resp.json())
        .then((result) => this.displayTime(result));
    },
    displayTime: function(timeData) {
        // console.log(timeData);
        const timezone = timeData.results[0].timezone.offset_STD;
        displayTime.innerText = 'Local Time: ' + this.convertTime(timezone);
    },
    convertTime: function(offset) {
                // convert date 
        const targetTime = new Date();
        const timeZoneFromDB = parseInt(offset); //time zone value from database
        //get the timezone offset from local time in minutes
        const tzDifference = timeZoneFromDB * 60 + targetTime.getTimezoneOffset();
        //convert the offset to milliseconds, add to targetTime, and make a new Date
        const offsetTime = new Date(targetTime.getTime() + tzDifference * 60 * 1000);

        // a HH:MM format
        let h = offsetTime.getHours();
        let m = offsetTime.getMinutes();
        if (h < 10) h = '0' + h;
        if (m < 10) m = '0' + m;
        const displayTime = h + ':' + m;
        displayTime.textContent = 'Local Time: ' + displayTime;

        displayLoading.classList.remove('not-found');
        displayLoading.classList.remove('loading');

        return displayTime;
    },
    fetchImage: function(searchValue) {
        fetch(
            `https://api.pexels.com/v1/search?query=${searchValue}`, {
                headers: {
                    Authorization :
                    '5EhEVbMnoio6m4d1nmUaqnpJfNHLVL1nWNxbGCAYXxu2kjPZu8CRYGsx'
                }
            }
        )
        .then((response) => response.json())
        .then((data) => this.displayImage(data.photos));
    },
    displayImage: function(data) {
        console.log(data);
        const random = Math.floor(Math.random() * data.length);  
        if (screen.width < 769) {
            document.body.style.backgroundImage = `url("${data[random].src.portrait}")`;
        } else {
            document.body.style.backgroundImage = `url("${data[random].src.landscape}")`;
        }
        console.log(data[random].src.portrait);
    
        //document.body.style.backgroundImage = `url("${data[random].src.portrait}")`;
        // htmlIcon.src = data[random].src.landscape;
    },
}

window.onload = function() {
    weather.fetchLocation('tokyo');
    weather.fetchImage('tokyo');
}

input.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        input.blur();
        if (filterInput(input.value)) return displayWeather();
    }
})

searchBtn.addEventListener('click', () => {
    if (filterInput(input.value)) return displayWeather();
})

function displayWeather() {
    displayLoading.classList.add('loading');
    weather.fetchLocation(input.value);
}

function filterInput(input) {
    const regEx = /^.{3,}$/
    console.log(regEx.test(input))
    if (!regEx.test(input)) {
        displayLoading.classList.add('not-found');
        return false;
    }
    return true;
}


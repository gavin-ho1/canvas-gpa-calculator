var numerator = 0
var denominator = 0

//Scrape HTML by each header
//For each header id "grade", add first number to numerator, last number to denominator
//Calculator grade, return grade as percentage and a string grade
//Need to find <span class="tooltip">

const headers = document.querySelectorAll("span.screenreader-only")
headers.forEach(header => {
    console.log(header.textContent);
    document.getElementById('result').innerText = header.textContent
  });


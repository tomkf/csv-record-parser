const csv = require("csv-parser");
const fs = require("fs");

//this variable holds the information directly from the CSV file
const results = [];

//this variable populated with the parsed CSV file, each violation category is unique key
const violationCategory = {};

//this var. holds number of violations per category
const numberOfViolations = {};

//holds earliest/latest reccords
//first index is earliest, 2nd index is latest
const dateRecords = {};

//this varibale holds the desired final results
const finalResult = {};

fs.createReadStream("C4C-dev-challenge-2018.csv")
  .pipe(csv())
  .on("data", data => results.push(data))
  .on("end", () => {
    createParsedCategories(results);
    calculateViolations(violationCategory);
    calculateDates(violationCategory);
    finalResult["Number of violations"] = numberOfViolations;
    finalResult["Date Reccords"] = dateRecords;
    console.log(finalResult);
  });

//this function parses the CSV file
const createParsedCategories = dataSet => {
  //create categories
  for (let i = 0; i < results.length; i++) {
    let uniqueCategoryName = results[i].violation_category;
    violationCategory[uniqueCategoryName] = {
      violations: [],
      violationDate: [],
      dateClosed: []
    };
  }

  //populate categories
  for (let key in violationCategory) {
    for (let y = 0; y < results.length; y++) {
      if (results[y].violation_category == key) {
        results[y].violation_id
          ? violationCategory[key].violations.push(results[y].violation_id)
          : violationCategory[key].violations.push("n/a");

        results[y].violation_date
          ? violationCategory[key].violationDate.push(results[y].violation_date)
          : violationCategory[key].violationDate.push("n/a");

        results[y].violation_date_closed
          ? violationCategory[key].dateClosed.push(
              results[y].violation_date_closed
            )
          : violationCategory[key].dateClosed.push("n/a");
      }
    }
  }
};

//this function calulates # of violations for each category
const calculateViolations = parsedObj => {
  for (let category in parsedObj) {
    let title = category;
    numberOfViolations[title] = parsedObj[category].violations.length;
  }
};

//this function calculates earliest and latest violation dates
const calculateDates = parsedObj => {
  for (let category in parsedObj) {
    let violationStart = parsedObj[category].violationDate;
    let convertDate = violationStart.map(date => new Date(date));
    let lowestDate = Math.min(...convertDate);
    let finalDate = new Date(lowestDate).toString();
    dateRecords[category] = [finalDate];
  }

  for (let category in parsedObj) {
    let violationEnd = parsedObj[category].dateClosed;
    const removeBlank = violationEnd.filter(item => item !== "n/a");
    let convertDate = removeBlank.map(date => new Date(date));
    let largestDate = Math.max(...convertDate);
    let finalDate = new Date(largestDate).toString();
    dateRecords[category].push(finalDate);
  }
};

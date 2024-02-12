const puppeteer = require("puppeteer");
const sqlite3 = require("sqlite3").verbose()
const db = new sqlite3.Database(
  "/Users/liamtarry/Desktop/SFU:Andrew Work/Sqlite/companies.db",
  sqlite3.OPEN_READWRITE
);
// Connecting to local database and setting variables for required plugins.

async function start() {
  const browser = await puppeteer.launch({
    timeout: 80000,
  });
  const page = await browser.newPage();
  await page.goto(
    "https://biopharmguy.com/links/company-by-location-canada.php"
  );
  // Launching headless browser and adding timeout to prevent being blocked.
  
  await page.waitForSelector(
    "body > div > div.table > table > tbody > tr > td.company > a"
  );
  // Creating a variable to wait for the part of the page we want to access to load before running.
  
  const names = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(
        "body > div > div.table > table > tbody > tr > td.company > a"
      )
    ).map((x) => x.textContent);
  });
  // Creating a variable to select names within the part of the html we want.
  
  var filteredNames = names.filter(function (el) {
    return el != "";
  });
  const descriptions = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(
        "body > div.siteContainer > div.table > table > tbody > tr > td.description"
      )
    ).map((x) => x.textContent);
  });
  // Creating a variable to select the company descriptions within the part of the html we want.

  const locations = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(
        "body > div.siteContainer > div.table > table > tbody > tr > td.location"
      )
    ).map((x) => x.textContent);
  });
  // Creating a variable to select the company locations within the part of the html we want.
  
  const combinedData = [];
  for (let i = 0; i < filteredNames.length; i++) {
    const companyData = `{${filteredNames[i]}, ${locations[i]}, ${descriptions[i]}}`;
    combinedData.push(companyData);
  }
  console.log(combinedData);
    const tableName = 'companies';

    combinedData.forEach((companyData) => {
        const [companyName, companyLocation, companyDescription] = companyData
            .replace(/[{}]/g, '')
            .split(',')
            .map((item) => item.trim());

        const stmt = db.prepare(`INSERT INTO ${tableName} (name, location, description) VALUES (?, ?, ?)`);

        stmt.run(companyName, companyLocation, companyDescription);
        stmt.finalize();
    });
  // Combinging the data gathered and inputting it into our local database within correct columns.
  
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Close the database connection.');
    });
  await browser.close();
}
// Logging any error results to check the process and solve for errors.
start();

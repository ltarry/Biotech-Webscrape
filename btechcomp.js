const puppeteer = require("puppeteer");
const sqlite3 = require("sqlite3").verbose()
const db = new sqlite3.Database(
  "/Users/liamtarry/Desktop/SFU:Andrew Work/Sqlite/companies.db",
  sqlite3.OPEN_READWRITE
);

async function start() {
  const browser = await puppeteer.launch({
    timeout: 80000,
  });
  const page = await browser.newPage();
  await page.goto(
    "https://biopharmguy.com/links/company-by-location-canada.php"
  );
  await page.waitForSelector(
    "body > div > div.table > table > tbody > tr > td.company > a"
  );
  const names = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(
        "body > div > div.table > table > tbody > tr > td.company > a"
      )
    ).map((x) => x.textContent);
  });
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

  const locations = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(
        "body > div.siteContainer > div.table > table > tbody > tr > td.location"
      )
    ).map((x) => x.textContent);
  });
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

    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Close the database connection.');
    });
  await browser.close();
}
start();

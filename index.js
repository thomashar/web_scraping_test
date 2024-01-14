import puppeteer from "puppeteer";
import { writeFile } from 'fs/promises';

const run = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  try {
    await page.goto("https://www.realtor.com/realestateandhomes-search/Ohio", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector('.BasePropertyCard_propertyCardWrap__Lanpw');

    const ohioListings = await page.evaluate(() => {
      const listings = [];

      const listingElements = document.querySelectorAll('.BasePropertyCard_propertyCardWrap__Lanpw');

      listingElements.forEach((listingElement) => {

        const brokerHandler = listingElement.querySelector('.BrokerTitle_titleText__01g0J');
        const imageHandler = listingElement.querySelector('.BasePropertyCard_fallBackImg__KzZlW');
        const priceHandler = listingElement.querySelector('.card-price');
        const featureHandler = listingElement.querySelector('.PropertyMetastyles__StyledPropertyMeta-rui__sc-1g5rdjn-0.iQEvdK.card-meta');
        const locationHandler = listingElement.querySelector('.card-address.truncate-line');
        const statusHandler = listingElement.querySelector('.message')

        const replaceNewlines = (text) => text.replace(/\n/g, ' ');

        const getInnerText = (element) => element ? replaceNewlines(element.innerText) : 'N/A';

        let listingData;

        if (getInnerText(brokerHandler) == 'Advertisement') {
          listingData = {
            broker   : 'Advertisement',
            image    : 'Advertisement',
            price    : 'Advertisement',
            feature  : 'Advertisement',
            location : 'Advertisement',
            status   : 'Advertisement',
          };
        } else {
          listingData = {
            broker   : getInnerText(brokerHandler),
            image    : imageHandler ? imageHandler.src : 'N/A',
            price    : getInnerText(priceHandler),
            feature  : getInnerText(featureHandler),
            location : getInnerText(locationHandler),
            status   : getInnerText(statusHandler),
          };
        }

        listings.push(listingData);
      })
      return listings;
    });

    await writeFile('ohioListings.json', JSON.stringify(ohioListings, null, 2), 'utf-8');

    // Display the quotes
    console.log(ohioListings);
  } catch (error) {
    console.error('An error occurred:', error.message);
  } finally {
    // Close the browser
    await browser.close();
  }
};

// Start the scraping
run();

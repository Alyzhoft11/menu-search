const fetch = require('node-fetch');
const cheerio = require('cheerio');
const db = require('./db');

const getResturants = async (state, city) => {
    const url = `https://www.allmenus.com/${state}/${city}/-/`;
    const response = await fetch(url);
    const body = await response.text();
    const $ = cheerio.load(body);

    const promises = [];

    $('.restaurant-list-item').each((i, item) => {
        const $item = $(item);
        const header = $item.find('h4.name');
        const name = header.text();
        const $anchor = $(header).find('a');
        const link = $anchor.attr('href');

        const id = $anchor.attr('data-masterlist-id');

        const address = [];
        $item.find('div.address-container .address').each((i, part) =>{
            const $part = $(part);
            address.push($part.text().trim());
         });

        const cuisines = $item.find('p.cousine-list').text().trim().split(', ');

        const grubhub = $item.find('a.grubhub').attr('href');

        const restaurant = {
            id,
            name,
            address: address.join('\n'),
            city,
            state,
            cuisines,
            link
        };

        if (grubhub) {
            restaurant.grubhub = grubhub;
        }

        const newRestaurantRef = db.collection('restaurants').doc(id);
        promises.push(newRestaurantRef.set(restaurant));
    });
    await Promise.all(promises);
    console.log('Done');
};

getResturants('mn', 'minneapolis');

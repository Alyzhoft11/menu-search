const fetch = require('node-fetch');
const cheerio = require('cheerio');
const db = require('./db');

const delay = (milliseconds) => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, milliseconds);
    });
}

const getResturants = async (state, city) => {
    const url = `https://www.allmenus.com/${state}/${city}/-/`;
    const response = await fetch(url);
    const body = await response.text();
    const $ = cheerio.load(body);

    const promises = [];
    const restaurants = [];

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
        restaurants.push(restaurant);
    });

    for (const restaurant of restaurants) {
        await getMenu(restaurant.id, restaurant.link);
        await delay(1000);
    }

    await Promise.all(promises);
    console.log('Done');
};

getResturants('mn', 'minneapolis');

const getMenu = async (id, link) => {
    // var docRef = db.collection('restaurants').doc(id);
    // const doc =  await docRef.get();
    // const restaurant = doc.data();
    // console.log(restaurant);

    const url = `https://www.allmenus.com${link}`
    const response = await fetch(url);
    const body = await response.text();
    const $ = cheerio.load(body);

    const rawJSON = $($('script[type="application/ld+json"]')[0]).html().replace(/\n/g, '');
    const data = JSON.parse(rawJSON);

    if (data.hasMenu && data.hasMenu.length > 0) {
        const promises = [];
        data.hasMenu.forEach(menu => {
            if (menu.hasMenuSection && menu.hasMenuSection.length > 0) {
                menu.hasMenuSection.forEach(section => {
                    if (section.hasMenuItem && section.hasMenuItem.length > 0){
                        section.hasMenuItem.forEach(item => {
                            item.restaurant_id = id;
                            item.menu_name = menu.name;
                            item.menu_section_name = section.name;
                            item.geo = data.geo;
                            
                            promises.push(db.collection('menu_items').add(item));
                        });
                    }
                });
            }
        });

        await Promise.all(promises);
        console.log('Inserted Menu Items', id, link);

    } else {
        console.log('No Menu Food', id, link);
    }
};

// getMenu('5587', '/mn/minneapolis/5587-the-shout-house/menu/');

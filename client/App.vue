<template>
    <section>
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <a class="navbar-brand" href="#">I'm Hungry</a>
        </nav>
        <section class="container mt-5">
            <form @submit.prevent="searchMenuItems()">
                <div class="form-group">
                    <label for="search">Search</label>
                    <input v-model="search" type="text" class="form-control" id="exampleInputEmail1" aria-describedby="searchHelp">
                    <small id="searcHelp" class="form-text text-muted">Enter a menu item to search.</small>
                </div>
                <button type="submit" class="btn btn-primary">Search</button>
            </form>
            <div>
                <div v-for="item in items" :key="item.id">
                    <h3>{{item.name}}</h3>
                    <dl v-if="item.offers && item.offers.length">
                        <dt>Price</dt>
                        <dd>${{item.offers[0].Price}}</dd>
                    </dl>
                    <div v-if="restaurants[item.restaurant_id].grubhub">
                        <a target="_blank" rel="noopener noreferrer" :href="restaurants[item.restaurant_id].grubhub">
                            <img src="https://www.allmenus.com/static/images/order-on-grubhub-button.png">
                        </a>
                    </div>
                    <small><em><a target="_blank" rel="noopener noreferrer" :href="`https://www.allmenus.com${restaurants[item.restaurant_id].link}`">{{restaurants[item.restaurant_id].name}}</a></em></small>
                </div>
            </div>
        </section>
    </section>
</template>

<script>
import db from './db'
export default {
    data: () => ({
        search: '',
        items: [],
        restaurants: {}
    }),
    mounted() {
        db.collection('restaurants').get()
            .then(querySnapshot => {
                const restaurants = {};
                querySnapshot.forEach((doc) => {
                const restaurant = doc.data();
                restaurants[restaurant.id] = restaurant;
            });
            this.restaurants = restaurants;
        });
    },
    methods: {
        searchMenuItems() {
            db.collection('menu_items').where('name', '==', this.search).get()
                .then(querySnapshot => {
                    const items = [];
                    querySnapshot.forEach((doc) => {
                    const item = doc.data();
                    item.id = doc.id;
                    items.push(item);
                });
                console.log(items);
                this.items = items;
            });
        }
    }
};
</script>

<style>
    @import url('https://bootswatch.com/4/minty/bootstrap.min.css');
</style>

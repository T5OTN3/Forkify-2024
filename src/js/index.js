// Global app controller

import Recipe from "./modules/Recipe.js";
import Search from "./modules/Search.js";
import { clearLoader, elements, renderLoader } from "./views/base.js"
import * as searchView from "./views/searchView.js";
import * as recipeView from "./views/recipeView.js";
import * as listView from "./views/listView.js";
import List from "./modules/List.js";


/* 
- Search object
- Current recipe object
- Shopping List object
- Liked recipes
*/

const state = {};
window.state = state;

/* Search Cpntroller */
const controlSearch = async (e) => {
    e.preventDefault(); 

    // 1. Get Query value
    const query = searchView.getInput();

    if(query){
        // 2. New Search object generate
        state.search = new Search(query);

        // 3. Prepare UI for result
        searchView.clearInput()
        searchView.clearResults();
        renderLoader(elements.searchResList)

        try {
            // 4. Search API
            await state.search.getResults()
        } catch (error) {
            alert("Search Error")
        }

        // 5. Render results  om UI
        searchView.renderResult(state.search.result)
        clearLoader()
        
        console.log(state)
    }

}

elements.searchForm.addEventListener("submit", controlSearch);


elements.searchResPage.addEventListener("click", e => {
    const btn = e.target.closest(".btn-inline");

    if(btn){
        const goto = +btn.dataset.goto;
        searchView.clearResults();
        searchView.renderResult(state.search.result, goto)
    }
});

const controlRecipe = async () => {
    //get id
    const id = window.location.hash.replace("#","")

    if(id){
        //Prepare UI and add Loader
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        if(state.search) searchView.highlitedSelected(id);

        //Create new Object
        state.recipe = new Recipe(id)

        //Get recipe
        await state.recipe.getRecipe();
        state.recipe.calcTime();
        state.recipe.calcServings();
        state.recipe.parseIngredients();


        //Clear Loader and Render Recipe
        clearLoader();
        recipeView.renderRecipe(state.recipe)
    }

}

/* window.addEventListener("hashchange", controlRecipe);
window.addEventListener("load", controlRecipe); */

["hashchange","load"].forEach(event => window.addEventListener(event, controlRecipe) );

const conrollerList = () => {
    if(!state.list) {
        state.list = new List();

        //Add items
        state.recipe.ingredients.forEach(el => {
            const item = state.list.addItems(el.count, el.unit, el.ingredient);
            listView.renderItem(item)
        })
    }
}

// Handling recipe button click
elements.recipe.addEventListener("click", e => {
    if(e.target.matches(".btn-dec, .btn-dec *")){
        // dec
        if(state.recipe.servings > 1){
            state.recipe.updateServings("dec");
            recipeView.updateServingsIngredients(state.recipe)
        }
    }if(e.target.matches(".btn-inc, .btn-inc *")){
        // inc
        state.recipe.updateServings("inc");
        recipeView.updateServingsIngredients(state.recipe)
    }else if(e.target.matches(".recipe__btn__add, .recipe__btn__add *")){
        //List
        conrollerList()
    }
})

//Handle delete and update list item events
elements.shopping.addEventListener("click", (e) => {
    const id = e.target.closest(".shopping__item").dataset.itemid;

    if(e.target.matches(".shopping__delete, .shopping__delete *")){
        //delete
        state.list.deleteItem(id)
        //delete ui
        listView.deleteItem(id);
    }else if(e.target.matches(".shopping__count-value")){
        //update
        const val = parseInt(e.target.value,10);
        state.list.updateCount(id, val);
    }
})

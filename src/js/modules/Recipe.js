

export default class Recipe {
    constructor(id){
        this.id = id
    }

    async getRecipe(){
        const response = await fetch(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
        const data = await response.json();
        this.title = data.recipe.title;
        this.author = data.recipe.publisher;
        this.img = data.recipe.image_url;
        this.url = data.recipe.source_url;
        this.ingredients = data.recipe.ingredients
    }

    calcTime(){
        const numIng = this.ingredients.length;
        const period = Math.ceil(numIng / 3);
        this.time = period * 15;
    }

    calcServings(){
        this.servings = 4
    }

    parseIngredients(){
        const newIngredients = this.ingredients.map(el => {
            const unitsLong = ["tablespoons", "tablespoon","ounces","ounce","teaspoons", "teaspoon","cups"]
            const unitShort = ["tbsp","tbsp","oz","oz","tsp","tsp","cup"];
            const units = [...unitShort, "kg", "g", "pound"]
            
            // 1.uniform unit
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitShort[i])
            })

            // 2. remove paranethenses
            ingredient = ingredient.replace(/ *\(([^)]*)\) */g," ")

            // 3. parse ingredients into count, unit and ingredient
            // 1/2 tsp salt => ['1/2', 'tsp', 'salt']
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng = {};
            if(unitIndex > -1){
                //ex: 4 1/2
                //ex: 4 tsp
                const arrCount = arrIng.slice(0, unitIndex);

                let count;
                if(arrCount.length === 1){
                    count = eval(arrIng[0]);
                }else{
                    count = eval(arrCount.join("+"))
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(" ")
                }
            }else if(parseInt(arrIng[0], 10)){
                // no unit, but number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            }else if(unitIndex === -1){
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }

            return objIng
        })

        this.ingredients = newIngredients;
    }

    updateServings(type){
        //Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        //Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        })

        this.servings = newServings;
    }
}
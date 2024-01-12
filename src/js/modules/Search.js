export default class Search {
    constructor(query){
        this.query = query
    }

    async getResults(){
        try {
            const result = await fetch(`https://forkify-api.herokuapp.com/api/search?q=${this.query}`);
            const res = await result.json()
            this.result = res.recipes;
        } catch (error) {
            alert("Search Error")
        }
    }
}
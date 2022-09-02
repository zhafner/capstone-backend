import fetch from "node-fetch";
import apiKeyImport from "./apiKeyMovies";

let apiKey = process.env.MOVIE_API_KEY || apiKeyImport;


const search = async (query)=>{
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${query}&api_key=${apiKey}`);
    const data = await response.json();
    return data;
}

export const providers = async (id)=>{
    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${apiKey}&locale=US`);
    const data = await response.json();
    return data;
}

export default search;

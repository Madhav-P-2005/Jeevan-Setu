// Path :- jeevansetu-frontend/src/lib/auth.js

let accessToken = null;
const STORAGE_KEY = "accessToken";


// Initialize from localStorage on load (browser only)
if (typeof window !=="undefined"){
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) accessToken = saved;
}


// Save token (in-memory and localStorage)
export function setAccessToken(token){
    
    accessToken = token || null;
    if (typeof window !=="undefined"){
        if (token){
            window.localStorage.setItem(STORAGE_KEY , token);

        }else {
            window.localStorage.removeItem(STORAGE_KEY);
        }
    }

}


// Read token (prefer in-memory , fallback to localStorage)
export function getAccessToken(){

    if (accessToken) return accessToken;
    

    if(typeof window !== "undefined"){
        return window.localStorage.getItem(STORAGE_KEY);
    }

    return null;
}



// Clear token from memory and localStorage
export function clearAccessToken(){

    accessToken = null;
    
    if(typeof window !=="undefined"){
        window.localStorage.removeItem(STORAGE_KEY);
    }
}
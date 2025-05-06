import Cookies from 'js-cookie';


function saveToStore(val, data) {
    Cookies.set(val, JSON.stringify(data), { expires: 100 });
}

function getFromStore(val) {
   let data =  Cookies.get(val);  
   if (data) {
     data = JSON.parse(data);
  }
  return data;
}

function removeFromStore() {
  Object.keys(Cookies.get()).forEach(function(cookieName) {
    Cookies.remove(cookieName);
  });
}

export { saveToStore, getFromStore, removeFromStore };
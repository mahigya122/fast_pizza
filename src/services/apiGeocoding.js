export async function getUserAddress() {                                       //async → function works with asynchronous operations and returns a Promise. An asynchronous operation is a task that runs in the "background" without stopping the rest of your code from executing. Instead of waiting for one line to finish before moving to the next (synchronous), the program continues running other logic while waiting for the async task to finish. i.e. datafetching, geolocation etc
  return new Promise((resolve, reject) => {                    //This gives you manual control: resolve() → success, reject() → error       //A Promise is a JavaScript object that acts as a placeholder for a value that isn't available yet but will be at some point. It represents the eventual success or failure of an asynchronous operation i.e. getUserAddress() will return a Promise that resolves with the user's address once it's retrieved, or rejects if there's an error.
    if (!navigator.geolocation) {                                   //If browser doesn’t support location:  
      reject(new Error("Geolocation not supported"));             //stop function and return error message.
      return;
    }

    navigator.geolocation.getCurrentPosition(                   //navigator.geolocation.getCurrentPosition() This asks user:“Allow access to your location?”
      async (position) => {                                       //If allowed → gives: latitude and longitude in the position object. We use async here because this will make another asynchronous call to fetch the address from the coordinates.
        const { latitude, longitude } = position.coords;                     //Extracts coordinates

        try {
          // Using OpenStreetMap reverse geocoding (no API key needed)
          const res = await fetch(                                                               //You send coordinates to OpenStreetMap API and it returns: street, city, country etc. This is called reverse geocoding (coordinates → address). We use await here because we need to wait for the API response before we can continue.
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`                  
          );

          const data = await res.json();                            //wait until we get responce like this Kathmandu, Bagmati Province, Nepal

          resolve({
            latitude,
            longitude,
            address: data.display_name,                     //Kathmandu, Bagmati Province, Nepal
          });
        } catch (err) {
          reject(err);                                //if user denies permission API fails or any other error occurs, we reject the Promise with the error message.
        }
      },
      (err) => reject(err)
    );
  });
}
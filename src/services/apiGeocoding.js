export async function getUserAddress() {                                       
    if (!navigator.geolocation) {                                   //If browser doesn’t support location:  
      throw new Error("Geolocation not supported");           
    }

    const position = await new Promise((resolve, reject) => {          //We create a new Promise that will resolve with the user's geolocation coordinates.This method takes two callback functions: one for success (when the user allows access to their location) and one for error (when the user denies permission or if there's an error getting the location).
      navigator.geolocation.getCurrentPosition(resolve, reject);            
    });

    const { latitude, longitude } = position.coords;                     //Extracts coordinates

    // Using OpenStreetMap reverse geocoding (no API key needed)
    const res = await fetch(                                                              
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`                  
          );

    const data = await res.json();                            //wait until we get responce like this Kathmandu, Bagmati Province, Nepal

    return{
      latitude,
      longitude,
      address: data.display_name,                     //Kathmandu, Bagmati Province, Nepal
      };
    }
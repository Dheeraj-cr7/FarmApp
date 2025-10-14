const data = async () => {
    // 1. **CORRECT URL** - Specify the pin you want to read (e.g., V1)
    let res = await fetch("https://blynk.cloud/external/api/get?token=rXyLOwEuTjlV3jmL1bXOzcqcB8eDb_Rk&pin=V0");
    
    // 2. **CORRECT PARSING** - Use .text() for a single pin read
    let d = await res.text();
    
    // d will now contain the raw value, e.g., "1024"
    console.log(d); 
}
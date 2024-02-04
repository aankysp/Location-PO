const searchIPBtn = document.getElementById('search-ip');
const beforeClickBox = document.getElementById('content-box-main');
const AfterClickBox = document.getElementById('content-box-after-click');

// Step - 1 --> fetching ip address
window.addEventListener('DOMContentLoaded', async () => {
    const ipAddressElement = document.getElementById('co-ordinates');

    try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        // user_data.postal = data.ip;
      
        ipAddressElement.textContent = data.ip;
        // localStorage.setItem('ip', JSON.stringify(data));

        // console.log(data);
    } catch (error) {
        ipAddressElement.textContent = '127.0.01';
        console.log('Error fetching IP address:', error);
    }
});

// console.log(user_data);

// Step - 2 --> after click, show info, map etc
searchIPBtn.addEventListener('click', async () => {
    beforeClickBox.style.display = 'none';
    AfterClickBox.style.display = 'block';
    console.log('search ip button clicked');
    const ipAddressElement = document.getElementById('co-ordinates-display');
    const ipAddFields = document.getElementsByClassName('ip-add-fiels');
    const map = document.getElementsByTagName('iframe')[0];
    // console.log(ipAddFields);
    const latitude = ipAddFields[0];
    const longitude = ipAddFields[1];
    const city = ipAddFields[2];
    const region = ipAddFields[3];
    const organisation = ipAddFields[4];
    const hostname = ipAddFields[5];

    try {
        //https://api.ipify.org/?format=json
        const response0 = await fetch("https://api.ipify.org/?format=json");
        const data0 = await response0.json();
        // console.log("data0",data0);
        // const response = await fetch(`https://ipinfo.io/${data0.ip}?token=10aba4bc147929`);
        // const data = await response.json();
        // console.log("data",data);
       
        const geoResponse = await fetch(`https://ipinfo.io/${data0.ip}/geo`);
        const data = await geoResponse.json();
        console.log("data",data);
        
        displayInfo(data);

        // Step 3: Update the content with the geo information
        const [lat, long] = data.loc.split(',');

        ipAddressElement.textContent = data.ip;
        latitude.textContent = lat;
        longitude.textContent = long;
        organisation.textContent = data.org;
        city.textContent = data.city;
        hostname.textContent = data.hostname;
        region.textContent = data.region;

        // show loaction on map 
        const newSrc = `https://maps.google.com/maps?q=${lat}, ${long}&z=15&output=embed`; // Replace with the desired URL
        map.src=newSrc;
        // console.log(geoData.latitude);
        // console.log(geoData.longitude);
    } catch (error) {
        // If an error occurs, show an error message
        ipAddressElement.textContent = '127.0.01';
        console.log('Error fetching IP address:', error);
    }
});


// Step - 3 --> get timezone, date 
function displayInfo(geoData) {
    // extract timezone
    const timezone = new Intl.DateTimeFormat(undefined, { timeZoneName: 'long' }).format();
    //    console.log(timezone);
    const info_location = document.getElementsByClassName('info-display');

    const time_zone = info_location[0];
    const date_time = info_location[1];
    const pincode = info_location[2];

    // extract date and time
    const now = new Date();
    //    console.log(timezone.getLocaleTimeString());  // 8/5/2023, India Standard Time
    const options = {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };


    const date = timezone.split(',')[0];

    // Get hours, minutes, and seconds from the Date object
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Format the time in hh:mm:ss format
    const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;

    // Function to pad single digits with leading zeros (helper function)
    function padZero(number) {
        return number < 10 ? `0${number}` : number;
    }
    console.log(date);
    console.log(formattedTime); // Output in hh:mm:ss format, e.g., "12:34:56"
    console.log(timezone.split(',')[1].trim());

    //    const time = now.get
    // 
    // extract pincode
    const pin_code = geoData.postal;
    console.log(pin_code);

    time_zone.textContent = timezone.split(',')[1];
    date_time.textContent = ` ${date} ${formattedTime}`;
    pincode.textContent = ` ${geoData.postal}` || ' Not available';

    getPincodes(geoData);
}

// Step - 4 --> get po from pincode
async function getPincodes(geoData) {
    const message = document.getElementById('no-of-po-found');
    const pincodeInfoResponse = await fetch(`https://api.postalpincode.in/pincode/${geoData.postal}`);
    const pincodeInfoData = await pincodeInfoResponse.json();
    console.log(pincodeInfoData);
    message.textContent = `Number of pincode(s) found: ${pincodeInfoData[0].PostOffice.length}`;

    // Step 7: Update the content with the pincode information
    if (Array.isArray(pincodeInfoData[0].PostOffice) && pincodeInfoData.length > 0) {
        displayPO(pincodeInfoData[0].PostOffice);
    }
}

var postOffice_list = null;
function displayPO (postOffices) {
    if (postOffice_list === null) postOffice_list = postOffices;
    const cardBox = document.getElementById('po-cards-box');
    cardBox.innerHTML = '';
    console.log(postOffices);
    postOffices.forEach(postOffice => {
        const po_card = document.createElement('div');
        po_card.className = 'po-card';
        po_card.innerHTML = `
                <div>
                    <p><span>${postOffice.Name}</span></p>
                </div>
                <div>
                    <p><span>${postOffice.BranchType}</span></p>
                </div>
                <div>
                    <p><span>${postOffice.DeliveryStatus}</span></p>
                </div>
                <div>
                    <p><span>${postOffice.District}</span></p>
                </div>
                <div>
                    <p><span>${postOffice.Division}</span></p>
                </div>
            `;
        cardBox.appendChild(po_card);
    });
}

// Step - 6 --> implement search function
const searchBar = document.getElementById('searched-term');
searchBar.addEventListener('keyup', () => {
    console.log('keyup event', searchBar.value.toLowerCase());
    // filter the data
    let searched_term =  searchBar.value.toLowerCase();
    const filteredPOs = filterData(searched_term);

    displayPO(filteredPOs);
});


function filterData(searched_term) {
    // filter here
    var ansArray = postOffice_list.filter((postOffice) => {
        if (postOffice.Name.toLowerCase().includes(searched_term)) {
            return postOffice;
        }
    });

    return ansArray;
}
const fs = require('fs');
const https = require('https');

const RSS_URL = 'https://google.com';

function getFeed() {
    https.get(RSS_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            parseAndJSON(data);
        });
    }).on('error', (err) => {
        console.error("Error fetching RSS:", err.message);
    });
}

function parseAndJSON(xmlData) {
    const items = xmlData.split('<item>');
    let newsHTML = '';

    for(let i = 1; i < Math.min(items.length, 7); i++) {
        const item = items[i];
        
        let title = 'ताज़ा खबर';
        if(item.includes('<title>')) {
            title = item.split('<title>')[1].split('</title>')[0];
            title = title.split(' - ')[0]; // Remove source name if present
        }
        
        let link = '#';
        if(item.includes('<link>')) {
            link = item.split('<link>')[1].split('</link>')[0];
        }
        
        newsHTML += `
            <div class="news-card">
                <img src="https://unsplash.com" alt="News">
                <div class="body">
                    <span class="tag" style="background:#d71920">ताज़ा ख़बर</span>
                    <h3><a href="${link}" target="_blank">${title}</a></h3>
                    <p>देश और दुनिया की ताज़ा ख़बरों के लाइव अपडेट्स यहाँ देखें। पूरी खबर पढ़ने के लिए लिंक पर क्लिक करें।</p>
                    <div class="card-actions">
                        <a href="${link}" target="_blank" class="share-btn" style="display:inline-block; text-align:center;">पढ़ें</a>
                    </div>
                </div>
            </div>\n`;
    }

    let indexHTML = fs.readFileSync('index.html', 'utf8');
    
    const startMarker = '<div class="news-grid">';
    const endMarker = '</div>\n    </main>';
    
    if (!indexHTML.includes(startMarker) || !indexHTML.includes(endMarker)) {
        console.error("Error: Markers not found in index.html");
        return;
    }
    
    const parts = indexHTML.split(startMarker);
    const firstPart = parts[0] + startMarker;
    const secondPart = parts[1].split(endMarker)[1];
    
    const finalHTML = firstPart + '\n' + newsHTML + '        ' + endMarker + secondPart;
    
    fs.writeFileSync('index.html', finalHTML, 'utf8');
    console.log("News Grid Updated Successfully!");
}

getFeed();

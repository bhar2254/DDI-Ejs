const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { debugLog } = require('./harper')

const downloadImage = async function(url, folderPath, fileName) {
    try {
        // Create the folder if it doesn't exist
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // Define the full path for the image file
        const filePath = path.join(folderPath, `${fileName}.webp`);

        // Check if the file already exists
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            const lastModified = new Date(stats.mtime);
            const now = new Date();

            // Calculate the age of the file in milliseconds
            const fileAgeInMs = now - lastModified;
            const hoursDifference = fileAgeInMs / (1000 * 60 * 60);

            // Check if the file is older than 12 hours
            if (hoursDifference < 12) {
                debugLog(`File ${filePath} is less than 12 hours old. Skipping download.`);
                return
            }
            console.log(`File ${filePath} is older than 12 hours. Overwriting...`)
        }

        debugLog(`Fetching data from url: ${url}`)
        // Get the image from the URL
        const response = await axios({ url, method: 'GET', responseType: 'arraybuffer' });

        // Convert the image to webp format using sharp
        const webpImage = await sharp(response.data).webp().toBuffer();

        // Save the image to the folder
        fs.writeFileSync(filePath, webpImage);

        console.log(`Image saved as ${filePath}`);
    } catch (error) {
        console.error('Error downloading or processing the image:', error);
    }
}


module.exports = {
    downloadImage: downloadImage,
}
# Paul Graham Essays Scraper

## Overview
This script scrapes essays from [Paul Graham's website](http://www.paulgraham.com) and processes them, breaking them into chunks for further analysis.

## Features
- Retrieves a list of essay links from the website.
- Fetches individual essays, extracts relevant information, and encodes the text.
- Breaks down essays into chunks based on a specified token limit.
- Logs the processed essay chunks.

## Technologies Used
- Axios for making HTTP requests
- Cheerio for HTML parsing
- GPT-3 Encoder for text encoding

## Requirements
- Node.js installed
- Dependencies installed (Run `npm install`)

## How to Use
1. Clone the repository: `git clone [repository-url]`
2. Install dependencies: `npm install`
3. Run the script: `node script.js`

## Example Output
- The script logs the list of essay links and the processed essay chunks.

## Configuration
- You can modify the `BASE_URL` and `CHUNK_SIZE` variables in the script for different websites or token limits.

## Contributing
Feel free to contribute by opening issues or submitting pull requests.

## License
This project is licensed under the [MIT License](LICENSE).

---

**Note:** Ensure that you have the necessary permissions to scrape and use the data from the specified website.

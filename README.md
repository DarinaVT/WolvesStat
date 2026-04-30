Wolvesville Stats Tracker

A web application that uses the Wolvesville API to visualize player statistics and clan information.

Features

Ranked Season Statistics
View detailed statistics for the current Ranked season across multiple time frames: daily, weekly, monthly and all time.

Clan Search
Search for any clan by name. If the clan exists, the following information is displayed: general clan info (name, description, level, etc.), leader profile and stats, co-leaders list, and full member roster.

Tech Stack

Frontend: HTML, CSS, JavaScript
Backend: Node.js
Data: Wolvesville Official API

Getting Started

Prerequisites: Node.js (v18 or higher) and a valid Wolvesville API key.

Installation: Clone the repository, navigate to the project folder and run "npm install".

Configuration

Create a .env file in the root directory with the following variables:

BASE_URL=https://api.wolvesville.com
API_KEY=your_api_key_here

Never share or commit your .env file. Make sure it is listed in .gitignore.

Running the App: Run "node server.js" and open your browser at http://localhost:3000

License

This project is for educational purposes only and is not affiliated with or endorsed by Wolvesville.

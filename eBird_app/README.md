# eBird-JavaScript-Final-Project
Final project for my Harvard Extension JavaScript course

Introduction:
 With this resource, I've attempted to recreate some of the functionality of eBird, the online birding checklist program where birders worldwide report and access their bird sightings. In doing so, I realized that I created a service not exactly provided by eBird: a way to quickly search and view recent bird sightings filtered by zip code (or current location), or by species, within a specified date range. While my creation isn't the prettiest thing to look at, I find that it works well to accomplish that task.

Find Birds by Location:
  1. On page load, the map defaults to center itself and searches near downtown Los Angeles.
  2. To define a new search, input a zip code into the Zip Code input element.
    a. You can also drag the map to create a new search.
  3. The page defaults to a search within the last week (7 days), but you can change this window to between the last 1 to 30 days.
  4. Click "Find Birds" to initiate a new search.

Find Birds by Species:
  1. On page load, the map defaults to center itself and searches near downtown Los Angeles.
  2. To define a new search, start by selecting the "Filter by species" checkbox, which displays a new input element.
  3. Then, input a zip code into the Zip Code input element.
    a. You can also drag the map to create a new search.
  4. The page defaults to a search within the last week (7 days), but you can change this window to between the last 1 to 30 days.
  5. Input the common name of a species in the species input element.
    a. The autocomplete function should assist you in choosing an appropriately formatted species name.
  6. Click "Find Birds" to initiate a new search.

  Other Features:
  * Clicking on a species name (or species location if searching by species) to view extra details, including links to the bird's AllAboutBirds page (created by the Cornell Lab of Ornithology), as well as its Wikipedia page.
  * Clicking on the map marker will open an info window on the map with the name of its location, as well as highlight in the sidebar the selection of birds reported at that location.
  * Clicking on the "Go to Current Location" will center the map and initiate a search at your current location (given that you have allowed the system to access your current location).
    * It seems that for this feature to work in Chrome, this page must be hosted on a server. It seems that it works without that requirement in Firefox and Safari.

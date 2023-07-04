# <img height="40px" src="https://prettytransit.com/icon.png"> prettytransit

A timelapse public transit visualization app built with Pixi and Vue.

![image](https://github.com/zorapeteri/prettytransit/assets/52820291/33a5ca6a-78c7-4aed-9c18-f78216fda795")

## context

i like trains

## data source

[prettytransit-gtfs-parser](https://github.com/zorapeteri/prettytransit-gtfs-parser)

## how it works

Each city has a list of transport types defined, with an intentional order. When you open a city, the default transport type will be displayed, e.g. `/budapest` will become `/budapest/metro`.

The URL can be manipulated to include any number of transport types or lines.
For example: `/berlin/U1,S1,tram`

_**Exception:** if there are at least 2 transport types available for a city, displaying all bus lines at once will be forbidden. This is because usually in cities that have extended public transit systems, there'll be a very large number of bus lines in contrast to other travel modes. For example Berlin has 200 bus lines compared with 22 tram lines coming in second._


When transit lines are displayed in the control panel under "showing", they can be hovered over or clicked to highlight the track of the line on the map.

For the movement of vehicles, [PIXI.Ticker](https://pixijs.download/dev/docs/PIXI.Ticker.html) is used. Each vehicle has its own ticker, that gets deleted when the journey is over.

At every single stop, irregardless of vehicle type, a 30 second [dwell time](<https://en.wikipedia.org/wiki/Dwell_time_(transportation)>) is assumed. I timed this on multiple types of Berlin transit, at different times of day and it seems a good average. This causes the flow of vehicles to not be continous, but rather realistic.

_**Fun fact**: Datasets that include bus and tram lines that have very frequent stops tend to (understandably) make large generalizations for the travel times between stops, which can make it look like the movement of vehicles is borderline coreographed. If you go to [berlin/tram](https://prettytransit.com/berlin/tram) and put the speed to 120x and start playing [Pump Up The Jam](https://open.spotify.com/track/21qnJAMtzC6S5SESuqQLEK?si=31bc47663e1e41b2) at the right time, you can look at the trams vibing._

### credits and attributions

All names and icons of public transit lines are trademarks of the authorities highlighted in the information panel for each city.

The graphics in the speed control buttons are from [google noto emoji](https://github.com/googlefonts/noto-emoji).

Maps of cities are from [OpenStreetMap](https://www.openstreetmap.org/).

<a href="https://www.flaticon.com/free-icons/train" title="logo by smashicons / flaticons">logo by flaticons</a>

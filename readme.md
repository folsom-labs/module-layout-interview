## Folsom Labs Interview: Solar Panel Layout

In this question, you'll need to create a tiling algorithm to fill a user defined polygon with Solar Panels.  We've already created sample code that lets a user input a polygon on Google Maps and then draws a single rectangle representing a solar panel at an arbitrary point (`fillPolygon` is the relevant function here).

### Instructions
Spend an hour or two (please don't spend any more time than that), and see how far you can get.  Feel free to modify the code however you see fit.

The goal is to create a simple algorithm that fills a user defined polygon with solar panels (known as solar *modules* in the industry). Ideally solar modules should only be placed in the polygon if they fit entirely in the shape (note, this rule is not enforced in the current dummy code).

The current parameters to use for your layout code are:
* *module width* how wide the solar panels are in meters (e.g. in the x-axis)
* *module height* how tall the solar panels are in meters (e.g. in the y-axis)
* *row spacing* how much space to leave between adjacent rows of modules in meters.  See the linked documentation for a better understanding of row spacing

This is based on a real problem we have in HelioScope – the first step (of a very long) analysis pipeline is simply figure out how many solar panels could fit in a given area. [This training video (1:39)](https://www.youtube.com/watch?v=cnyIpSLW6hg) from HelioScope shows how many of the rules work. [This image](https://helioscope.folsomlabs.com/static/helioscope/documentation/static/overlays/fixed-racking.png) from our documentation visualizes a few of these parameters: **row spacing**, **tilt**, and **modules in row** ('Frame Size = 4 Modules Up' would be the same as '4 **Modules in Row**')

### Setting up and running

to set a up a development environment, we use yarn (you could also use npm):
```bash
brew install yarn
yarn install
```

to run it, just use:
```bash
yarn start
```

this will open a browser at `http://localhost:8080/` served with livereload and webpack.

### Submission

When finished, just submit a pull request to the master branch and we'll take a look.  As above *please* let us know if you have any questions or comments – our goal is to create a useful, relevant, and (hopefully) interesting exercise; not to frustrate you!

### Bachelor's Thesis Project.
## Visualiztion of Manufacture Schedules.

### Run application:
**npm install** - installs all the dependences.  
**npm start** - starts the application.

The application is running on ```localhost:3003```.

**npm run generate-tests** - generates testing data (in a form of SQLite database file).  
**npm run clean-tests** - removes all generated files.


### Project structure:
```
/database       - Script for reading data from a database file.
/node_module    - NPM modules.
/public         - Main part of the project (JS modularized app that makes schedule visualization).
    /css
    /img
    /js         - Modules and components of the application.
/tests          - Scripts for generating testing data.
/upload         - Folder for uploded database files.
/views          - Basic views of the application.
app.js          - Main controller - starting point of the whole project.
package.json    - NPM module dependencies.
```

For **DatePicker**, **Search** and **Filter** application components the following external libraries were used:  
[Vanilla JS Datepicker](https://www.npmjs.com/package/vanillajs-datepicker)  
[autoComplete.js](https://www.npmjs.com/package/@tarekraafat/autocomplete.js)  
[Bootstrap Multiselect](https://www.npmjs.com/package/bootstrap-multiselect)

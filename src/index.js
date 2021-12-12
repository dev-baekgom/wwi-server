const school = require("korean-school");
const Timetable = require("comcigan-parser");
const http = require("http");
const url = require("url");

//get lunch function
const getMeal = async () => {
    const meal = await school.getMeal(
        school.find("부산광역시", "남천중"),
        new Date(2021, 11, 9)
    );
    if (meal !== null) {
        return meal.lunch;
    }
}

//get timetable function
const getTimetable = async () => {
    /*
    const timetable = await school.getSchedule(school.find("부산광역시", "남천중"), 3, 1, new Date(2021, 11, 9));
    if (timetable !== null) {
        return timetable;
    }
    */

    
    const timetable = new Timetable();

    const schoolFinder = (schoolName, region) => (schoolList) => {
        const targetSchool = schoolList.find((school) => {
            return school.region === region && school.name.includes(schoolName);
        });
        return targetSchool;
    };

    timetable
        .init({ cache: 1000 * 60 * 60 })
        .then(() => timetable.search("남천중"))
        .then(schoolFinder("남천중", "부산"))
        .then((school) => timetable.setSchool(school.code))
        .then(() => {
            Promise.all([
                timetable.getClassTime(),
                timetable.getTimetable(),
            ]).then((res) => {
                return res[1][3][1];
            });
        });
}

//create a server object:
http.createServer(async (req, res) => {
    const urlData = url.parse(req.url, true);
    if (urlData.query.what === "meal") {
        getMeal().then((meal) => {
            res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
            res.write(meal);
            res.end();
        });
    } else if (urlData.query.what === "timetable") {
        getTimetable().then((timetable) => {
            res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
            res.write(JSON.stringify(timetable));
            res.end();
        })
    }
}).listen(8080); //the server object listens on port 8080

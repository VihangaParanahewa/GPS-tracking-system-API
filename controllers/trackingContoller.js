var async = require('async');
var hexToDec = require('hex-to-dec');

var TrackingData = {   
    splitData : function (req, res, next) {
        var testData = req;
        let newTackingData = {};
        //console.log("test:  " + testData);
        const tasks = [
            function time(cb) {
                dateDec = hexToDec(testData.substring(25,36));
                var date = new Date(dateDec);
                newTackingData.date = date;
                return cb(null, date);
            },
            function longitude(cb) {
                longi = hexToDec(testData.substring(38,46));
                var longitude = longi/10000000;
                newTackingData.longitude=longitude;
                return cb(null, longitude);
            },
            function latitude(cb) {
                lati = hexToDec(testData.substring(46,54));
                var latitude = lati/10000000;
                newTackingData.latitude = latitude;
                return cb(null, latitude);
            },
            function altitude(cb) {
                var altitude = hexToDec(testData.substring(54,58));
                newTackingData.altitude = altitude;
                return cb(null, altitude);
            },
            function angle(cb) {
                var angle = hexToDec(testData.substring(58,62));
                newTackingData.angle = angle;
                return cb(null, angle);
            },
            function sattelites(cb) {
                var sattelites = hexToDec(testData.substring(62,64));
                newTackingData.sattelites=sattelites;
                return cb(null, sattelites);
            },
            function speed(cb) {
                var speed = hexToDec(testData.substring(64,68));
                newTackingData.speed=speed;
                return cb(null, speed);
            } 
        ];

        async.series(tasks, (err, results) => {
            if (err) {
                console.log(err);
            }
        });  
        return newTackingData;
    }
}

module.exports = TrackingData;